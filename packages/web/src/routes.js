import React, { Fragment, lazy, Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import DashboardLayout from 'src/layouts/DashboardLayout'
import MainLayout from 'src/layouts/MainLayout'
import HomeView from 'src/views/home/HomeView'
import LoadingScreen from 'src/components/LoadingScreen'
import AuthGuard from 'src/components/AuthGuard'
import GuestGuard from 'src/components/GuestGuard'
import { isMenuLinkToShow } from './utils/logics'

export const renderRoutes = (routes = [], priority) => {
  return (
    <Suspense fallback={<LoadingScreen/>}>
      <Switch>
        {
          routes.reduce((acc, route, index) => {
            const Guard = route.guard || Fragment
            const Layout = route.layout || Fragment
            const Component = route.component
            if (isMenuLinkToShow(route, {priority})) {
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
                              ? renderRoutes(route.routes, priority)
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
    exact: true,
    guard: GuestGuard,
    path: '/register',
    component: lazy(() => import('src/views/auth/RegisterView')),
  },
  {
    exact: true,
    path: '/register-unprotected',
    component: lazy(() => import('src/views/auth/RegisterView')),
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
        path: '/app/calendar',
        component: lazy(() => import('src/views/calendar/CalendarView')),
      },
      {
        exact: true,
        path: [
          '/app/chat/new',
          '/app/chat/:threadKey',
        ],
        component: lazy(() => import('src/views/chat/ChatView')),
      },
      {
        exact: true,
        path: '/app/chat',
        component: () => <Redirect to="/app/chat/new"/>,
      },
      {
        exact: true,
        path: '/app/extra/charts/apex',
        component: lazy(() => import('src/views/extra/charts/ApexChartsView')),
      },
      {
        exact: true,
        path: '/app/extra/forms/formik',
        component: lazy(() => import('src/views/extra/forms/FormikView')),
      },
      {
        exact: true,
        path: '/app/extra/forms/redux',
        component: lazy(() => import('src/views/extra/forms/ReduxFormView')),
      },
      {
        exact: true,
        path: '/app/extra/editors/draft-js',
        component: lazy(() => import('src/views/extra/editors/DraftEditorView')),
      },
      {
        exact: true,
        path: '/app/extra/editors/quill',
        component: lazy(() => import('src/views/extra/editors/QuillEditorView')),
      },
      {
        exact: true,
        path: '/app/kanban',
        component: lazy(() => import('src/views/kanban/KanbanView')),
      },
      {
        exact: true,
        path: [
          '/app/mail/label/:customLabel/:mailId?',
          '/app/mail/:systemLabel/:mailId?',
        ],
        component: lazy(() => import('src/views/mail/MailView')),
      },
      {
        exact: true,
        path: '/app/mail',
        component: () => <Redirect to="/app/mail/all"/>,
      },
      {
        exact: true,
        path: '/app/management/customers',
        component: lazy(() => import('src/views/customer/CustomerListView')),
      },
      {
        exact: true,
        path: '/app/management/customers/:customerId',
        component: lazy(() => import('src/views/customer/CustomerDetailsView')),
      },
      {
        exact: true,
        path: '/app/management/customers/:customerId/edit',
        component: lazy(() => import('src/views/customer/CustomerEditView')),
      },
      {
        exact: true,
        path: '/app/management/invoices',
        component: lazy(() => import('src/views/invoice/InvoiceListView')),
      },
      {
        exact: true,
        path: '/app/management/invoices/:invoiceId',
        component: lazy(() => import('src/views/invoice/InvoiceDetailsView')),
      },
      {
        exact: true,
        path: '/app/management/orders',
        component: lazy(() => import('src/views/order/OrderListView')),
      },
      {
        exact: true,
        path: '/app/management/orders/:orderId',
        component: lazy(() => import('src/views/order/OrderDetailsView')),
      },
      {
        exact: true,
        path: '/app/management/products',
        component: lazy(() => import('src/views/product/ProductListView')),
      },
      {
        exact: true,
        path: '/app/management/products/create',
        component: lazy(() => import('src/views/product/ProductCreateView')),
      },
      {
        exact: true,
        path: '/app/management',
        component: () => <Redirect to="/app/management/customers"/>,
      },
      {
        exact: true,
        path: '/app/projects/overview',
        component: lazy(() => import('src/views/project/OverviewView')),
      },
      {
        exact: true,
        path: '/app/projects/browse',
        component: lazy(() => import('src/views/project/ProjectBrowseView')),
      },
      {
        exact: true,
        path: '/app/projects/create',
        component: lazy(() => import('src/views/project/ProjectCreateView')),
      },
      {
        exact: true,
        path: '/app/projects/:id',
        component: lazy(() => import('src/views/project/ProjectDetailsView')),
      },
      {
        exact: true,
        path: '/app/projects',
        component: () => <Redirect to="/app/projects/browse"/>,
      },
      {
        exact: true,
        private: [3],
        path: [
          '/app/reports/browser',
          '/app/reports/browser/:docId',
        ],
        component: lazy(() => import('src/views/reports/Browser')),
      },
      {
        exact: true,
        path: '/app/reports/dashboard',
        component: lazy(() => import('src/views/reports/DashboardView')),
      },
      {
        exact: true,
        path: '/app/reports/dashboard-alternative',
        component: lazy(() => import('src/views/reports/DashboardAlternativeView')),
      },
      {
        exact: true,
        path: '/app/reports',
        component: () => <Redirect to="/app/reports/dashboard"/>,
      },
      {
        exact: true,
        path: '/app/social/feed',
        component: lazy(() => import('src/views/social/FeedView')),
      },
      {
        exact: true,
        path: '/app/social/profile',
        component: lazy(() => import('src/views/social/ProfileView')),
      },
      {
        exact: true,
        path: '/app/social',
        component: () => <Redirect to="/app/social/profile"/>,
      },
      {
        exact: true,
        path: '/app',
        component: () => <Redirect to="/app/reports/dashboard"/>,
      },
      {
        component: () => <Redirect to="/404"/>,
      },
    ],
  },
  {
    path: '*',
    layout: MainLayout,
    routes: [
      {
        exact: true,
        path: '/',
        component: HomeView,
      },
      {
        exact: true,
        path: '/pricing',
        component: lazy(() => import('src/views/pricing/PricingView')),
      },
      {
        component: () => <Redirect to="/404"/>,
      },
    ],
  },
]
/* eslint-enable react/display-name */

export default routes
