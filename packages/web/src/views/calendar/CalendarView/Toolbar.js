import React from 'react'
import clsx from 'clsx'
import moment from 'moment'
import PropTypes from 'prop-types'
import { Button, ButtonGroup, Grid, Hidden, IconButton, makeStyles, Tooltip, Typography } from '@material-ui/core'
import ViewConfigIcon from '@material-ui/icons/ViewComfyOutlined'
import ViewWeekIcon from '@material-ui/icons/ViewWeekOutlined'
import ViewDayIcon from '@material-ui/icons/ViewDayOutlined'
import ViewAgendaIcon from '@material-ui/icons/ViewAgendaOutlined'

const viewOptions = [
  {
    label: 'Month',
    value: 'dayGridMonth',
    icon: ViewConfigIcon,
  },
  {
    label: 'Week',
    value: 'timeGridWeek',
    icon: ViewWeekIcon,
  },
  {
    label: 'Day',
    value: 'timeGridDay',
    icon: ViewDayIcon,
  },
  {
    label: 'Agenda',
    value: 'listWeek',
    icon: ViewAgendaIcon,
  },
];

const useStyles = makeStyles(() => ({
  root: {},
}));

const Toolbar = ({
  className,
  date,
  onDateNext,
  onDatePrev,
  onDateToday,
  onAddClick,
  onViewChange,
  view,
  ...rest
}) => {
  const classes = useStyles();

  return (
    <Grid
      alignItems="center"
      className={clsx(classes.root, className)}
      container
      justify="space-between"
      spacing={3}
      {...rest}
    >
      <Grid item>
        <ButtonGroup size="small">
          <Button onClick={onDatePrev}>Prev</Button>
          <Button onClick={onDateToday}>Today</Button>
          <Button onClick={onDateNext}>Next</Button>
        </ButtonGroup>
      </Grid>
      <Hidden smDown>
        <Grid item>
          <Typography
            color="textPrimary"
            variant="h3"
          >
            {moment(date).format('MMMM YYYY')}
          </Typography>
        </Grid>
        <Grid item>
          {
            viewOptions.map((viewOption) => {
              const Icon = viewOption.icon;

              return (
                <Tooltip
                  key={viewOption.value}
                  title={viewOption.label}
                >
                  <IconButton
                    color={viewOption.value === view ? 'secondary' : 'default'}
                    onClick={() => onViewChange(viewOption.value)}
                  >
                    <Icon />
                  </IconButton>
                </Tooltip>
              );
            })
          }
        </Grid>
      </Hidden>
    </Grid>
  );
};

Toolbar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  date: PropTypes.instanceOf(Date).isRequired,
  view: PropTypes.oneOf(['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek']),
  onAddClick: PropTypes.func,
  onDateNext: PropTypes.func,
  onDatePrev: PropTypes.func,
  onDateToday: PropTypes.func,
  onViewChange: PropTypes.func,
};

Toolbar.defaultProps = {
  onDateNext: () => {},
  onDatePrev: () => {},
  onDateToday: () => {},
  onAddClick: () => {},
  onViewChange: () => {},
};

export default Toolbar;
