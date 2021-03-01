import {
  BarChart as BarChartIcon,
  Clock as ClockIcon,
  DollarSign as DollarSignIcon,
  FileText as FileTextIcon,
  Inbox as InboxIcon,
  List as ListIcon,
  PieChart as PieChartIcon,
} from 'react-feather'

const sections = [
  {
    subheader: 'reports',
    items: [
      {
        title: 'Browser',
        exact: false,
        private: 4,
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
        title: 'e_invoices',
        exact: false,
        icon: InboxIcon,
        href: '/app/reports/e-invoices',
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
    subheader: 'management',
    items: [
      {
        title: 'Import',
        exact: false,
        icon: InboxIcon,
        href: '/app/management/import',
      },
    ],
  },
  /*
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
  },*/
]

export default sections
