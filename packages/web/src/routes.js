import React, { Fragment, lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import DashboardLayout from 'src/layouts/DashboardLayout'
import AuthGuard from 'src/components/AuthGuard'
import GuestGuard from 'src/components/GuestGuard'
import { isMenuLinkToShow } from './utils/logics'
import LoadingFacebookStyleBoxed from './components/LoadingFacebookStyleBoxed'

export const renderRoutes = (routes = [], priority, code, extra) => {
  return (
    <Suspense fallback={<LoadingFacebookStyleBoxed/>}>
      <Switch>
        {
          routes.reduce((acc, route, index) => {
            const Guard = route.guard || Fragment
            const Layout = route.layout || Fragment
            const Component = route.component
            if (isMenuLinkToShow(route, { priority, code, extra })) {
              acc.push(
                <Route
                  exact={route.exact}
                  key={index}
                  path={route.path}
                  render={
                    props => (
                      <Guard>
                        <Layout>
                          {
                            route.routes
                              ? renderRoutes(route.routes, priority, code, extra)
                              : <Component {...props} />
                          }
                        </Layout>
                      </Guard>
                    )
                  }
                />
              )
            }
            return acc
          }, [])
        }
      </Switch>
    </Suspense>
  )
}
/* eslint-disable react/display-name */
const routes = [
  {
    exact: true,
    path: '/404',
    component: lazy(() => import('src/views/errors/Error404')),
  },
  {
    exact: true,
    guard: GuestGuard,
    path: '/login',
    component: lazy(() => import('src/views/auth/LoginView')),
  },
  {
    exact: true,
    path: '/login-unprotected',
    component: lazy(() => import('src/views/auth/LoginView')),
  },
  {
    path: '/app',
    guard: AuthGuard,
    layout: DashboardLayout,
    routes: [
      {
        exact: true,
        path: '/app/account',
        component: lazy(() => import('src/views/account/AccountView')),
      },
      {
        exact: true,
        path: [
          '/app/management/hotel',
          '/app/management/hotel/:statusId',
        ],
        component: lazy(() => import('src/views/management/Hotel')),
      },
      {
        exact: true,
        path: [
          '/app/management/import',
          '/app/management/import/:statusId',
        ],
        component: lazy(() => import('src/views/management/Import')),
      },
      {
        exact: true,
        path: '/app/management',
        component: () => <Redirect to="/app/management/import"/>,
      },
      {
        exact: true,
        private: [4, 3],
        path: [
          '/app/reports/browser',
          '/app/reports/browser/:docId',
        ],
        component: lazy(() => import('src/views/reports/Browser')),
      },
      {
        exact: true,
        path: [
          '/app/reports/closing-day',
          '/app/reports/closing-day/:docId',
        ],
        component: lazy(() => import('src/views/reports/ClosingDay')),
      },
      {
        exact: true,
        path: [
          '/app/reports/running-tables',
          '/app/reports/running-tables/:docId',
        ],
        component: lazy(() => import('src/views/reports/RunningTables')),
      },
      {
        exact: true,
        path: [
          '/app/reports/closed-tables',
          '/app/reports/closed-tables/:docId',
          '/app/reports/closed-tables/change-payment-method/:targetDocId',
        ],
        component: lazy(() => import('src/views/reports/ClosedTables')),
      },
      {
        exact: true,
        path: [
          '/app/reports/e-invoices',
          '/app/reports/e-invoices/:docId',
          '/app/reports/e-invoices/change-customer-data/:targetPaymentId',
          '/app/reports/e-invoices/notification/:notificationPaymentId',
        ],
        component: lazy(() => import('src/views/reports/EInvoices')),
      },
      {
        exact: true,
        path: [
          '/app/reports/sold-items',
        ],
        component: lazy(() => import('src/views/reports/SoldItems')),
      },
      /*{
        exact: true,
        path: '/app/reports/dashboard',
        component: lazy(() => import('src/views/reports/DashboardView')),
      },
      {
        exact: true,
        path: '/app/reports/dashboard-alternative',
        component: lazy(() => import('src/views/reports/DashboardAlternativeView')),
      },*/
      {
        exact: true,
        path: '/app/reports',
        component: () => <Redirect to="/app/reports/closing-day"/>,
      },
      {
        exact: true,
        path: '/app',
        component: () => <Redirect to="/app/reports/closing-day"/>,
      },
      {
        component: () => <Redirect to="/404"/>,
      },
    ],
  },
  {
    path: '*',
    //layout: MainLayout,
    routes: [
      {
        exact: true,
        guard: GuestGuard,
        path: '/',
        component: lazy(() => import('src/views/auth/LoginView')),
      },
      {
        component: () => <Redirect to="/404"/>,
      },
    ],
  },
]
/* eslint-enable react/display-name */

export default routes
