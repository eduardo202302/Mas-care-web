const LOWERCASE_WORDS = new Set([
  'de',
  'en',
  'al',
  'el',
  'la',
  'con',
  'para',
  'un',
])

/** Mayúscula inicial en cada palabra, salvo "de", "en", "al", "el", "la", "con", "para" y "un" (excepto al inicio). */
export function toTitleCase(text: string): string {
  return text
    .split(' ')
    .map((word, index) => {
      if (index > 0 && LOWERCASE_WORDS.has(word.toLowerCase()))
        return word.toLowerCase()
      return word.replace(
        /^([^A-Za-zÀ-ÿ]*)([A-Za-zÀ-ÿ])/,
        (_, prefix: string, letter: string) => prefix + letter.toUpperCase(),
      )
    })
    .join(' ')
}
