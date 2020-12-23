import {
  BarChart as BarChartIcon,
  Clock as ClockIcon,
  FileText as FileTextIcon,
  DollarSign as DollarSignIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  List as ListIcon,
  Lock as LockIcon,
  PieChart as PieChartIcon,
  Share2 as ShareIcon,
  User as UserIcon,
  UserPlus as UserPlusIcon,
  Users as UsersIcon,
} from 'react-feather'
import ReceiptIcon from '@material-ui/icons/ReceiptOutlined'

const sections = [
  {
    subheader: 'reports',
    items: [
      {
        title: 'Browser',
        exact: false,
        private: [4, 3],
        icon: ListIcon,
        href: '/app/reports/browser',
      },
      {
        title: 'closing_day',
        exact: false,
        icon: DollarSignIcon,
        href: '/app/reports/closing-day',
      },
      {
        title: 'running_tables',
        exact: false,
        icon: ClockIcon,
        href: '/app/reports/running-tables',
      },
      {
        title: 'closed_tables',
        exact: false,
        icon: FileTextIcon,
        href: '/app/reports/closed-tables',
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
    ],
  },
]

export default sections
