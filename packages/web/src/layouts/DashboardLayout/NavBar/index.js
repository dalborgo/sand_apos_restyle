/* eslint-disable no-use-before-define */
import React, { useEffect } from 'react'
import { Link as RouterLink, matchPath, useLocation } from 'react-router-dom'
import PerfectScrollbar from 'react-perfect-scrollbar'
import PropTypes from 'prop-types'
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  Hidden,
  Link,
  List,
  ListSubheader,
  makeStyles,
  Typography,
} from '@material-ui/core'
import ReceiptIcon from '@material-ui/icons/ReceiptOutlined'
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
import Logo from 'src/components/Logo'
import useAuth from 'src/hooks/useAuth'
import NavItem from './NavItem'

const sections = [
  {
    subheader: 'Reports',
    items: [
      {
        title: 'Browser',
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
];

function renderNavItems({
  items,
  pathname,
  depth = 0,
}) {
  return (
    <List disablePadding>
      {
        items.reduce(
          (acc, item) => reduceChildRoutes({ acc, item, pathname, depth }),
          []
        )
      }
    </List>
  );
}

function reduceChildRoutes({
  acc,
  pathname,
  item,
  depth,
}) {
  const key = item.title + depth;

  if (item.items) {
    const open = matchPath(pathname, {
      path: item.href,
      exact: false,
    });

    acc.push(
      <NavItem
        depth={depth}
        icon={item.icon}
        info={item.info}
        key={key}
        open={Boolean(open)}
        title={item.title}
      >
        {
          renderNavItems({
            depth: depth + 1,
            pathname,
            items: item.items,
          })
        }
      </NavItem>
    );
  } else {
    acc.push(
      <NavItem
        depth={depth}
        href={item.href}
        icon={item.icon}
        info={item.info}
        key={key}
        title={item.title}
      />
    );
  }

  return acc;
}

const useStyles = makeStyles(() => ({
  mobileDrawer: {
    width: 256,
  },
  desktopDrawer: {
    width: 256,
    top: 64,
    height: 'calc(100% - 64px)',
  },
  avatar: {
    cursor: 'pointer',
    width: 64,
    height: 64,
  },
}));

const NavBar = ({ onMobileClose, openMobile }) => {
  const classes = useStyles();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (openMobile && onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const content = (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
    >
      <PerfectScrollbar options={{ suppressScrollX: true }}>
        <Hidden lgUp>
          <Box
            display="flex"
            justifyContent="center"
            p={2}
          >
            <RouterLink to="/">
              <Logo />
            </RouterLink>
          </Box>
        </Hidden>
        <Box p={2}>
          <Box
            display="flex"
            justifyContent="center"
          >
            <RouterLink to="/app/account">
              <Avatar
                alt="User"
                className={classes.avatar}
                src="/static/images/avatars/avatar_6.png"
              />
            </RouterLink>
          </Box>
          <Box
            mt={2}
            textAlign="center"
          >
            <Link
              color="textPrimary"
              component={RouterLink}
              to="/app/account"
              underline="none"
              variant="h5"
            >
              {user.display}
            </Link>
            <Typography
              color="textSecondary"
              variant="body2"
            >
              Your tier:
              {' '}
              <Link
                component={RouterLink}
                to="/pricing"
              >
                {' '}
              </Link>
            </Typography>
          </Box>
        </Box>
        <Divider />
        <Box p={2}>
          {
            sections.map((section) => (
              <List
                key={section.subheader}
                subheader={
                  (
                    <ListSubheader
                      disableGutters
                      disableSticky
                    >
                      {section.subheader}
                    </ListSubheader>
                  )
                }
              >
                {
                  renderNavItems({
                    items: section.items,
                    pathname: location.pathname,
                  })
                }
              </List>
            ))
          }
        </Box>
        <Divider />
        <Box p={2}>
          <Box
            bgcolor="background.dark"
            borderRadius="borderRadius"
            p={2}
          >
            <Typography
              color="textPrimary"
              variant="h6"
            >
              Need Help?
            </Typography>
            <Link
              color="secondary"
              component={RouterLink}
              to="/docs"
              variant="subtitle1"
            >
              Check our docs
            </Link>
          </Box>
        </Box>
      </PerfectScrollbar>
    </Box>
  );

  return (
    <>
      <Hidden lgUp>
        <Drawer
          anchor="left"
          classes={{ paper: classes.mobileDrawer }}
          onClose={onMobileClose}
          open={openMobile}
          variant="temporary"
        >
          {content}
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Drawer
          anchor="left"
          classes={{ paper: classes.desktopDrawer }}
          open
          variant="persistent"
        >
          {content}
        </Drawer>
      </Hidden>
    </>
  );
};

NavBar.propTypes = {
  onMobileClose: PropTypes.func,
  openMobile: PropTypes.bool,
};

export default NavBar;
