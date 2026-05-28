import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/shared/components/router/ProtectedRoute'
import MainLayout from '@/shared/components/layouts/MainLayout'
import LoginPage from '@/modules/auth/LoginPage'
import DashboardPage from '@/modules/dashboard/DashboardPage'
import IndicationListingPage from '@/modules/indication/IndicationListingPage'
import CompaniesPage from '@/modules/companies/CompaniesPage'
import SegmentationPage from '@/modules/segmentation/SegmentationPage'
import TourismPage from '@/modules/tourism/TourismPage'
import IndicationDetailPage from '@/modules/indication/IndicationDetailPage'

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, handle: { breadcrumb: 'menu.dashboard' }, element: <DashboardPage /> },
          {
            path: 'indicacao-geografica',
            handle: { breadcrumb: 'menu.indication' },
            children: [
              { index: true, element: <IndicationListingPage /> },
              {
                path: ':id',
                handle: { dynamicBreadcrumb: true },
                element: <IndicationDetailPage />,
              },
            ],
          },
          {
            path: 'empresas',
            handle: { breadcrumb: 'menu.companies' },
            element: <CompaniesPage />,
          },
          {
            path: 'segmentacao-de-loja',
            handle: { breadcrumb: 'menu.segmentation' },
            element: <SegmentationPage />,
          },
          { path: 'turismo', handle: { breadcrumb: 'menu.tourism' }, element: <TourismPage /> },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
