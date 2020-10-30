import React, {
  useState,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Box,
  Button,
  Grid,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  makeStyles,
} from '@material-ui/core';
import {
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
} from '@material-ui/lab';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ProjectCard from 'src/components/ProjectCard';

const useStyles = makeStyles((theme) => ({
  root: {},
  title: {
    position: 'relative',
    '&:after': {
      position: 'absolute',
      bottom: -8,
      left: 0,
      content: '" "',
      height: 3,
      width: 48,
      backgroundColor: theme.palette.primary.main,
    },
  },
  sortButton: {
    textTransform: 'none',
    letterSpacing: 0,
    marginRight: theme.spacing(2),
  },
}));

const Results = ({ className, projects, ...rest }) => {
  const classes = useStyles();
  const sortRef = useRef(null);
  const [openSort, setOpenSort] = useState(false);
  const [selectedSort, setSelectedSort] = useState('Most popular');
  const [mode, setMode] = useState('grid');

  const handleSortOpen = () => {
    setOpenSort(true);
  };

  const handleSortClose = () => {
    setOpenSort(false);
  };

  const handleSortSelect = (value) => {
    setSelectedSort(value);
    setOpenSort(false);
  };

  const handleModeChange = (event, value) => {
    setMode(value);
  };

  return (
    <div
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Box
        alignItems="center"
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
        mb={2}
      >
        <Typography
          className={classes.title}
          color="textPrimary"
          variant="h5"
        >
          Showing
          {' '}
          {projects.length}
          {' '}
          projects
        </Typography>
        <Box
          alignItems="center"
          display="flex"
        >
          <Button
            className={classes.sortButton}
            onClick={handleSortOpen}
            ref={sortRef}
          >
            {selectedSort}
            <ArrowDropDownIcon />
          </Button>
          <ToggleButtonGroup
            exclusive
            onChange={handleModeChange}
            size="small"
            value={mode}
          >
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      <Grid
        container
        spacing={3}
      >
        {
          projects.map((project) => (
            <Grid
              item
              key={project.id}
              md={mode === 'grid' ? 4 : 12}
              sm={mode === 'grid' ? 6 : 12}
              xs={12}
            >
              <ProjectCard project={project} />
            </Grid>
          ))
        }
      </Grid>
      <Box
        display="flex"
        justifyContent="center"
        mt={6}
      >
        <Pagination count={3} />
      </Box>
      <Menu
        anchorEl={sortRef.current}
        elevation={1}
        onClose={handleSortClose}
        open={openSort}
      >
        {
          ['Most recent', 'Popular', 'Price high', 'Price low', 'On sale'].map(
            (option) => (
              <MenuItem
                key={option}
                onClick={() => handleSortSelect(option)}
              >
                <ListItemText primary={option} />
              </MenuItem>
            )
          )
        }
      </Menu>
    </div>
  );
}

Results.propTypes = {
  className: PropTypes.string,
  projects: PropTypes.array.isRequired,
};

export default Results;
