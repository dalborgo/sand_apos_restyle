import {
  Clock as ClockIcon,
  DollarSign as DollarSignIcon,
  FileText as FileTextIcon,
  Inbox as InboxIcon,
  List as ListIcon,
  Upload as UploadIcon,
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
      /*{
        title: 'Dashboard',
        icon: PieChartIcon,
        href: '/app/reports/dashboard',
      },
      {
        title: 'Dashboard Alternative',
        icon: BarChartIcon,
        href: '/app/reports/dashboard-alternative',
      },*/
    ],
  },
  {
    subheader: 'management',
    items: [
      {
        title: 'Import',
        exact: false,
        icon: UploadIcon,
        href: '/app/management/import',
      },
    ],
  },
]

export default sections
