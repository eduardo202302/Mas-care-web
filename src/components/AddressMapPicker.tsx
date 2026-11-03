import { useEffect, useRef, useState } from 'react'
import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { Info, MapPin, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { TextField } from '@/components/ui/TextField'
import { useMe } from '@/lib/permissions'

export type AddressMapValue = {
  address: string
  city: string
  state: string
  sector: string
  latitude: string
  longitude: string
}

/** Centro de República Dominicana, usado cuando aún no hay coordenadas. */
const DEFAULT_CENTER = { lat: 18.4861, lng: -69.9312 }

let optionsSet = false
let librariesPromise: Promise<{
  Map: typeof google.maps.Map
  Marker: typeof google.maps.Marker
  Geocoder: typeof google.maps.Geocoder
  Autocomplete: typeof google.maps.places.Autocomplete
}> | null = null

function loadGoogleMapsLibraries(apiKey: string) {
  if (!optionsSet) {
    setOptions({ key: apiKey })
    optionsSet = true
  }
  librariesPromise ??= Promise.all([
    importLibrary('maps'),
    importLibrary('marker'),
    importLibrary('geocoding'),
    importLibrary('places'),
  ]).then(([{ Map }, { Marker }, { Geocoder }, { Autocomplete }]) => ({
    Map,
    Marker,
    Geocoder,
    Autocomplete,
  }))
  return librariesPromise
}

function componentValue(
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string,
) {
  return components?.find((item) => item.types.includes(type))?.long_name ?? ''
}

function fillFromGeocoderResult(
  place: Pick<
    google.maps.GeocoderResult | google.maps.places.PlaceResult,
    'formatted_address' | 'address_components'
  >,
  current: AddressMapValue,
): AddressMapValue {
  const components = place.address_components
  return {
    ...current,
    address: place.formatted_address ?? current.address,
    city: componentValue(components, 'locality') || current.city,
    state:
      componentValue(components, 'administrative_area_level_1') ||
      current.state,
    sector:
      componentValue(components, 'administrative_area_level_2') ||
      current.sector,
  }
}

/**
 * Botón pequeño que abre un diálogo con mapa interactivo (buscar dirección o
 * arrastrar el marcador) y aplica dirección/ciudad/región/sector/lat/lng al
 * formulario que lo use. Un único componente comparten Paciente, Sucursal y
 * Centro Médico porque los seis campos de dirección son idénticos en los tres.
 */
export function AddressMapPicker({
  getValues,
  onApply,
}: {
  getValues: () => AddressMapValue
  onApply: (next: AddressMapValue) => void
}) {
  const { data: me } = useMe()
  const apiKey =
    me?.organization.googleMapsApiKey ||
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    ''
  const [initialValue, setInitialValue] = useState<AddressMapValue | null>(
    null,
  )
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="h-8 px-2.5 text-xs"
        onClick={() => setInitialValue(getValues())}
      >
        <MapPin className="size-3.5" />
        Ubicar en el Mapa
      </Button>
      {initialValue && (
        <AddressMapDialog
          initialValue={initialValue}
          apiKey={apiKey}
          onClose={() => setInitialValue(null)}
          onApply={(next) => {
            onApply(next)
            setInitialValue(null)
          }}
        />
      )}
    </>
  )
}

function AddressMapDialog({
  initialValue,
  apiKey,
  onClose,
  onApply,
}: {
  initialValue: AddressMapValue
  apiKey: string
  onClose: () => void
  onApply: (next: AddressMapValue) => void
}) {
  const mapNodeRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!apiKey) {
      setError(
        'No hay una clave de Google Maps configurada para esta compañía.',
      )
      setLoading(false)
      return
    }
    let cancelled = false
    loadGoogleMapsLibraries(apiKey)
      .then(({ Map, Marker, Geocoder, Autocomplete }) => {
        if (cancelled || !mapNodeRef.current) return
        const hasPosition = Boolean(initialValue.latitude && initialValue.longitude)
        const center = hasPosition
          ? {
              lat: Number(initialValue.latitude),
              lng: Number(initialValue.longitude),
            }
          : DEFAULT_CENTER

        const map = new Map(mapNodeRef.current, {
          center,
          zoom: hasPosition ? 16 : 12,
          disableDefaultUI: true,
          zoomControl: true,
        })
        const marker = new Marker({
          map,
          position: center,
          draggable: true,
        })
        const geocoder = new Geocoder()

        marker.addListener('dragend', () => {
          const position = marker.getPosition()
          if (position) applyCoordinates(position.lat(), position.lng())
        })
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (!event.latLng) return
          marker.setPosition(event.latLng)
          applyCoordinates(event.latLng.lat(), event.latLng.lng())
        })

        if (inputRef.current) {
          const autocomplete = new Autocomplete(inputRef.current, {
            fields: ['formatted_address', 'address_components', 'geometry'],
          })
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            const location = place.geometry?.location
            if (!location) return
            map.panTo(location)
            map.setZoom(16)
            marker.setPosition(location)
            setDraft((current) => ({
              ...fillFromGeocoderResult(place, current),
              latitude: location.lat().toFixed(6),
              longitude: location.lng().toFixed(6),
            }))
          })
        }
        setLoading(false)

        function applyCoordinates(lat: number, lng: number) {
          setDraft((current) => ({
            ...current,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
          }))
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            const top = results?.[0]
            if (status === 'OK' && top) {
              setDraft((current) => fillFromGeocoderResult(top, current))
            }
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('No pudimos cargar Google Maps. Verifica la clave de API.')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
    // Solo se ejecuta una vez al montar el diálogo; initialValue es la posición de arranque.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Dialog
      title="Ubicar en el Mapa"
      description="Busca una dirección o arrastra el marcador para ajustar el punto exacto."
      icon={<MapPin className="size-5" />}
      compactHeader
      size="xl"
      bodyClassName="pt-3"
      onClose={onClose}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="grid gap-3">
          <div className="relative">
            <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar dirección…"
              defaultValue={initialValue.address}
              className="border-border text-ink placeholder:text-muted/70 focus:border-tealmax focus:ring-tealmax/15 h-10 w-full rounded-lg border bg-white pr-3 pl-9 text-sm transition outline-none focus:ring-2"
            />
          </div>
          <div
            ref={mapNodeRef}
            className="border-border bg-surface h-72 w-full overflow-hidden rounded-lg border lg:h-80"
          />
          {loading && <p className="text-muted text-xs">Cargando mapa…</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="bg-modulos/60 border-border flex items-start gap-2 rounded-lg border px-3 py-2.5">
            <Info className="text-cuidado mt-0.5 size-4 shrink-0" />
            <p className="text-ink text-xs">
              Haz clic en el mapa o arrastra el marcador para ajustar el
              punto exacto. La dirección y el sector se completan
              automáticamente.
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-1 flex items-start gap-3">
            <div className="bg-modulos text-cuidado flex size-10 shrink-0 items-center justify-center rounded-xl">
              <MapPin className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-petroleo text-sm font-bold">
                Información de la ubicación
              </h3>
              <p className="text-muted text-xs">
                Verifica y ajusta los datos antes de guardar.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                label="Dirección"
                value={draft.address}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
              />
            </div>
            <TextField
              label="Región"
              value={draft.state}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  state: event.target.value,
                }))
              }
            />
            <TextField
              label="Ciudad"
              value={draft.city}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  city: event.target.value,
                }))
              }
            />
            <div className="sm:col-span-2">
              <TextField
                label="Sector"
                value={draft.sector}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    sector: event.target.value,
                  }))
                }
              />
            </div>
            <TextField
              label="Latitud"
              value={draft.latitude}
              readOnly
              className="bg-surface text-muted"
            />
            <TextField
              label="Longitud"
              value={draft.longitude}
              readOnly
              className="bg-surface text-muted"
            />
          </div>
        </div>
      </div>

      <div className="border-border mt-5 flex justify-end gap-2 border-t pt-4">
        <Button type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={loading}
          onClick={() => onApply(draft)}
        >
          Usar esta Ubicación
        </Button>
      </div>
    </Dialog>
  )
}
