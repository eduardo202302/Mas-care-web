import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequireAuth } from './RequireAuth'
import { NotFoundPage } from './NotFoundPage'
import { RequireRoute } from './RequireRoute'
import { RouteError } from './RouteError'

const AccessPage = lazy(() => import('@/features/auth/AccessPage'))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))
const ForgotPasswordPage = lazy(
  () => import('@/features/auth/ForgotPasswordPage'),
)
const VerifyPinPage = lazy(() => import('@/features/auth/VerifyPinPage'))
const ResetPasswordPage = lazy(
  () => import('@/features/auth/ResetPasswordPage'),
)
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const BoardPage = lazy(() => import('@/features/board/BoardPage'))
const IncidentsPage = lazy(() => import('@/features/incidents/IncidentsPage'))
const StockPage = lazy(() => import('@/features/settings/StockPage'))
const BranchesPage = lazy(() => import('@/features/branches/BranchesPage'))
const ChipsPage = lazy(() => import('@/features/dev/ChipsPage'))
const PatientsPage = lazy(() => import('@/features/patients/PatientsPage'))
const PatientDetailPage = lazy(
  () => import('@/features/patients/PatientDetailPage'),
)
const MedicationsPage = lazy(
  () => import('@/features/medications/MedicationsPage'),
)
const UsersPage = lazy(() => import('@/features/users/UsersPage'))
const CompaniesPage = lazy(() => import('@/features/companies/CompaniesPage'))
const ThresholdsPage = lazy(() => import('@/features/settings/ThresholdsPage'))
const TemplatesPage = lazy(() => import('@/features/settings/TemplatesPage'))
const TasksPage = lazy(() => import('@/features/tasks/TasksPage'))
const MenuPage = lazy(() => import('@/features/menu/MenuPage'))
const RolesPage = lazy(() => import('@/features/roles/RolesPage'))
const AutomationSettingsPage = lazy(
  () => import('@/features/automation/AutomationSettingsPage'),
)
const ConsolidatedDashboardPage = lazy(
  () => import('@/features/consolidated/ConsolidatedDashboardPage'),
)
const TransfersPage = lazy(() => import('@/features/transfers/TransfersPage'))
const ReportsIndexPage = lazy(() => import('@/features/reports/ReportsIndexPage'))
const ReportPage = lazy(() => import('@/features/reports/ReportPage'))

export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Navigate to="/inicio" replace /> },
      { path: '/acceso', element: <AccessPage /> },
      { path: '/registro', element: <RegisterPage /> },
      { path: '/recuperar', element: <ForgotPasswordPage /> },
      { path: '/recuperar/pin', element: <VerifyPinPage /> },
      { path: '/recuperar/nueva-contrasena', element: <ResetPasswordPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                // Only routes the user's role grants (see /me `menu`).
                element: <RequireRoute />,
                children: [
                  { path: '/inicio', element: <DashboardPage /> },
                  {
                    path: '/panel-global',
                    element: <ConsolidatedDashboardPage />,
                  },
                  { path: '/tablero', element: <BoardPage /> },
                  { path: '/traspasos', element: <TransfersPage /> },
                  { path: '/informes', element: <ReportsIndexPage /> },
                  { path: '/informes/:tipo', element: <ReportPage /> },
                  { path: '/incidencias', element: <IncidentsPage /> },
                  { path: '/tareas', element: <TasksPage /> },
                  { path: '/companias', element: <CompaniesPage /> },
                  { path: '/pacientes', element: <PatientsPage /> },
                  { path: '/pacientes/:id', element: <PatientDetailPage /> },
                  { path: '/medicamentos', element: <MedicationsPage /> },
                  { path: '/ajustes/usuarios', element: <UsersPage /> },
                  { path: '/ajustes/sucursales', element: <BranchesPage /> },
                  { path: '/ajustes/umbrales', element: <ThresholdsPage /> },
                  {
                    path: '/ajustes/automatizacion',
                    element: <AutomationSettingsPage />,
                  },
                  { path: '/ajustes/plantillas', element: <TemplatesPage /> },
                  { path: '/ajustes/existencias', element: <StockPage /> },
                  { path: '/ajustes/roles', element: <RolesPage /> },
                  { path: '/ajustes/menu', element: <MenuPage /> },
                  { path: '/dev/chips', element: <ChipsPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage fullScreen /> },
    ],
  },
])
