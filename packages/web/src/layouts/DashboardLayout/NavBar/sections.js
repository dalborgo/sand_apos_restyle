import {
  Clock as ClockIcon,
  DollarSign as DollarSignIcon,
  FileText as FileTextIcon,
  Key as KeyIcon,
  Inbox as InboxIcon,
  ShoppingCart as ShoppingCartIcon,
  List as ListIcon,
  Upload as UploadIcon,
} from 'react-feather'
import { NO_SELECTED_CODE } from 'src/contexts/JWTAuthContext'

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
        title: 'sold_items',
        exact: false,
        icon: ShoppingCartIcon,
        href: '/app/reports/sold-items',
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
    excludedCode: NO_SELECTED_CODE,
    items: [
      {
        title: 'Import/export',
        exact: false,
        icon: UploadIcon,
        href: '/app/management/import',
        excludedCode: NO_SELECTED_CODE,
      },
      {
        title: 'Hotel',
        exact: false,
        hotelEnabled: true,
        icon: KeyIcon,
        href: '/app/management/hotel',
        excludedCode: NO_SELECTED_CODE,
      },
    ],
  },
]

export default sections
