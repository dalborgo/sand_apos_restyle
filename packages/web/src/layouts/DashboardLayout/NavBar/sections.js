import React from 'react'
import {
  AlertCircle as AlertCircleIcon,
  BarChart as BarChartIcon,
  Briefcase as BriefcaseIcon,
  Calendar as CalendarIcon,
  DollarSign as DollarSignIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  Layout as LayoutIcon,
  List as ListIcon,
  Lock as LockIcon,
  Mail as MailIcon,
  MessageCircle as MessageCircleIcon,
  PieChart as PieChartIcon,
  Share2 as ShareIcon,
  ShoppingCart as ShoppingCartIcon,
  Trello as TrelloIcon,
  User as UserIcon,
  UserPlus as UserPlusIcon,
  Users as UsersIcon,
} from 'react-feather'
import ReceiptIcon from '@material-ui/icons/ReceiptOutlined'
import { Chip } from '@material-ui/core'

const sections = [
  {
    subheader: 'Reports',
    items: [
      {
        title: 'Browser',
        exact: false,
        private: [4, 3],
        icon: ListIcon,
        href: '/app/reports/browser',
      },
      {
        title: 'Dashboard',
        icon: PieChartIcon,
        href: '/app/reports/dashboard',
      },
      {
        title: 'Dashboard Alternative',
        icon: BarChartIcon,
        href: '/app/reports/dashboard-alternative',
      },
    ],
  },
  {
    subheader: 'Management',
    items: [
      {
        title: 'Customers',
        icon: UsersIcon,
        href: '/app/management/customers',
        items: [
          {
            title: 'List Customers',
            href: '/app/management/customers',
          },
          {
            title: 'View Customer',
            href: '/app/management/customers/1',
          },
          {
            title: 'Edit Customer',
            href: '/app/management/customers/1/edit',
          },
        ],
      },
      {
        title: 'Products',
        icon: ShoppingCartIcon,
        href: '/app/management/products',
        items: [
          {
            title: 'List Products',
            href: '/app/management/products',
          },
          {
            title: 'Create Product',
            href: '/app/management/products/create',
          },
        ],
      },
      {
        title: 'Orders',
        icon: FolderIcon,
        href: '/app/management/orders',
        items: [
          {
            title: 'List Orders',
            href: '/app/management/orders',
          },
          {
            title: 'View Order',
            href: '/app/management/orders/1',
          },
        ],
      },
      {
        title: 'Invoices',
        icon: ReceiptIcon,
        href: '/app/management/invoices',
        items: [
          {
            title: 'List Invoices',
            href: '/app/management/invoices',
          },
          {
            title: 'View Invoice',
            href: '/app/management/invoices/1',
          },
        ],
      },
    ],
  },
  {
    subheader: 'Applications',
    items: [
      {
        title: 'Projects Platform',
        href: '/app/projects',
        icon: BriefcaseIcon,
        items: [
          {
            title: 'Overview',
            href: '/app/projects/overview',
          },
          {
            title: 'Browse Projects',
            href: '/app/projects/browse',
          },
          {
            title: 'Create Project',
            href: '/app/projects/create',
          },
          {
            title: 'View Project',
            href: '/app/projects/1',
          },
        ],
      },
      {
        title: 'Social Platform',
        href: '/app/social',
        icon: ShareIcon,
        items: [
          {
            title: 'Profile',
            href: '/app/social/profile',
          },
          {
            title: 'Feed',
            href: '/app/social/feed',
          },
        ],
      },
      {
        title: 'Kanban',
        href: '/app/kanban',
        icon: TrelloIcon,
      },
      {
        title: 'Mail',
        href: '/app/mail',
        icon: MailIcon,
      },
      {
        title: 'Chat',
        href: '/app/chat',
        icon: MessageCircleIcon,
        // eslint-disable-next-line react/display-name
        info: () => (
          <Chip
            color="secondary"
            label="Updated"
            size="small"
          />
        ),
      },
      {
        title: 'Calendar',
        href: '/app/calendar',
        icon: CalendarIcon,
        // eslint-disable-next-line react/display-name
        info: () => (
          <Chip
            color="secondary"
            label="Updated"
            size="small"
          />
        ),
      },
    ],
  },
  {
    subheader: 'Auth',
    items: [
      {
        title: 'Login',
        href: '/login-unprotected',
        icon: LockIcon,
      },
      {
        title: 'Register',
        href: '/register-unprotected',
        icon: UserPlusIcon,
      },
    ],
  },
  {
    subheader: 'Pages',
    items: [
      {
        title: 'Account',
        href: '/app/account',
        icon: UserIcon,
      },
      {
        title: 'Error',
        href: '/404',
        icon: AlertCircleIcon,
      },
      {
        title: 'Pricing',
        href: '/pricing',
        icon: DollarSignIcon,
      },
    ],
  },
  {
    subheader: 'Extra',
    items: [
      {
        title: 'Charts',
        href: '/app/extra/charts',
        icon: BarChartIcon,
        items: [
          {
            title: 'Apex Charts',
            href: '/app/extra/charts/apex',
          },
        ],
      },
      {
        title: 'Forms',
        href: '/app/extra/forms',
        icon: EditIcon,
        items: [
          {
            title: 'Formik',
            href: '/app/extra/forms/formik',
          },
          {
            title: 'Redux Forms',
            href: '/app/extra/forms/redux',
          },
        ],
      },
      {
        title: 'Editors',
        href: '/app/extra/editors',
        icon: LayoutIcon,
        items: [
          {
            title: 'DraftJS Editor',
            href: '/app/extra/editors/draft-js',
          },
          {
            title: 'Quill Editor',
            href: '/app/extra/editors/quill',
          },
        ],
      },
    ],
  },
]

export default sections
