import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import {
  Button,
  Breadcrumbs,
  Box,
  Link,
  Dialog,
  Grid,
  Typography,
  makeStyles,
  Hidden,
} from '@material-ui/core';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import InvoicePDF from './InvoicePDF';

const useStyles = makeStyles((theme) => ({
  root: {},
  action: {
    marginBottom: theme.spacing(1),
    '& + &': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const Header = ({
  className,
  invoice,
  ...rest
}) => {
  const classes = useStyles();
  const [viewPDF, setViewPDF] = useState(false);

  return (
    <Grid
      className={clsx(classes.root, className)}
      container
      justify="space-between"
      spacing={3}
      {...rest}
    >
      <Grid item>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={<NavigateNextIcon fontSize="small" />}
        >
          <Link
            color="inherit"
            component={RouterLink}
            to="/app"
            variant="body1"
          >
            Dashboard
          </Link>
          <Link
            color="inherit"
            component={RouterLink}
            to="/app/management"
            variant="body1"
          >
            Management
          </Link>
          <Typography
            color="textPrimary"
            variant="body1"
          >
            Invoices
          </Typography>
        </Breadcrumbs>
        <Typography
          color="textPrimary"
          variant="h3"
        >
          Invoice Details
        </Typography>
      </Grid>
      <Grid item>
        <Hidden smDown>
          <Button
            className={classes.action}
            onClick={() => setViewPDF(true)}
          >
            Preview PDF
          </Button>
        </Hidden>
        <PDFDownloadLink
          document={<InvoicePDF invoice={invoice} />}
          fileName="invoice"
          style={{ textDecoration: 'none' }}
        >
          <Button
            className={classes.action}
            color="secondary"
            variant="contained"
          >
            Download PDF
          </Button>
        </PDFDownloadLink>
        <Dialog fullScreen open={viewPDF}>
          <Box
            display="flex"
            flexDirection="column"
            height="100%"
          >
            <Box
              bgcolor="common.white"
              p={2}
            >
              <Button
                color="secondary"
                onClick={() => setViewPDF(false)}
                variant="contained"
              >
                <NavigateBeforeIcon />
                Back
              </Button>
            </Box>
            <Box flexGrow={1}>
              <PDFViewer
                height="100%"
                style={{ border: 'none' }}
                width="100%"
              >
                <InvoicePDF invoice={invoice} />
              </PDFViewer>
            </Box>
          </Box>
        </Dialog>
      </Grid>
    </Grid>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  invoice: PropTypes.object.isRequired,
};

export default Header;
