import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';
import { Link as RouterLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Input,
  Link,
  Paper,
  Typography,
  makeStyles,
  SvgIcon,
} from '@material-ui/core';
import {
  Search as SearchIcon,
  MoreVertical as MoreIcon,
} from 'react-feather';
import axios from 'src/utils/axios';
import useIsMountedRef from 'src/hooks/useIsMountedRef';

const connectStatusMap = {
  connected: 'Connected',
  not_connected: 'Connect',
  pending: 'Pending',
};

const useStyles = makeStyles((theme) => ({
  root: {},
  searchInput: {
    marginLeft: theme.spacing(2),
  },
  avatar: {
    height: 60,
    width: 60,
  },
}));

const Connections = ({ className, ...rest }) => {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();
  const { enqueueSnackbar } = useSnackbar();
  const [connections, setConnections] = useState([]);
  const [search, setSearch] = useState('');

  const handleConnectToggle = (connectionId) => {
    setConnections((prevConnections) => {
      const newConnections = _.map(prevConnections, _.clone);

      return newConnections.map((connection) => {
        if (connection.id === connectionId) {
          const newConnection = { ...connection };

          newConnection.status = connection.status === 'connected' || connection.status === 'pending'
            ? 'not_connected'
            : 'pending';

          if (newConnection.status === 'pending') {
            enqueueSnackbar('Connection request sent', {
              variant: 'success',
            });
          }

          return newConnection;
        }

        return connection;
      });
    });
  };

  const getConnections = useCallback(async () => {
    const response = await axios.get('/api/social/connections');

    if (isMountedRef.current) {
      setConnections(response.data.connections);
    }
  }, [isMountedRef]);

  useEffect(() => {
    getConnections();
  }, [getConnections]);

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardHeader title="Connections" />
      <Divider />
      <Box
        alignItems="center"
        display="flex"
        px={3}
        py={2}
      >
        <SvgIcon
          color="action"
          fontSize="small"
        >
          <SearchIcon />
        </SvgIcon>
        <Input
          className={classes.searchInput}
          disableUnderline
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search connections"
          value={search}
        />
      </Box>
      <Divider />
      <Box p={3}>
        <Grid
          container
          spacing={3}
        >
          {
            connections
              .filter((connection) => connection.name.toLowerCase().includes(search))
              .map((connection) => (
                <Grid
                  item
                  key={connection.id}
                  md={6}
                  xs={12}
                >
                  <Paper variant="outlined">
                    <Box
                      alignItems="center"
                      display="flex"
                      p={2}
                    >
                      <Avatar
                        alt="Profile image"
                        className={classes.avatar}
                        component={RouterLink}
                        src={connection.avatar}
                        to="#"
                      />
                      <Box
                        flexGrow={1}
                        mx={2}
                      >
                        <Link
                          color="textPrimary"
                          component={RouterLink}
                          to="#"
                          variant="h5"
                        >
                          {connection.name}
                        </Link>
                        <Typography
                          color="textSecondary"
                          gutterBottom
                          variant="body2"
                        >
                          {connection.commonConnections}
                          {' '}
                        connections in common
                        </Typography>
                        {
                          connection.status !== 'rejected' && (
                            <Button
                              onClick={() => handleConnectToggle(connection.id)}
                              size="small"
                              variant="outlined"
                            >
                              {connectStatusMap[connection.status]}
                            </Button>
                          )
                        }
                      </Box>
                      <IconButton>
                        <SvgIcon fontSize="small">
                          <MoreIcon />
                        </SvgIcon>
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))
          }
        </Grid>
      </Box>
    </Card>
  );
};

Connections.propTypes = {
  className: PropTypes.string,
};

export default Connections;
