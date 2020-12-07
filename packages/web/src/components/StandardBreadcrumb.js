import { Breadcrumbs, Link, Typography } from '@material-ui/core'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import { Link as RouterLink } from 'react-router-dom'
import React from 'react'
import PropTypes from 'prop-types'

export function StandardBreadcrumb ({ crumbs }) {
  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextIcon fontSize="small"/>}
    >
      {
        crumbs.map(({ to, name }, index) => {
          if (to) {
            return (
              <Link
                color="inherit"
                component={RouterLink}
                key={index}
                to={to}
                variant="body1"
              >
                {name}
              </Link>
            )
          } else {
            return (
              <Typography
                color="textPrimary"
                key={index}
                variant="body1"
              >
                {name}
              </Typography>
            )
          }
        })
      }
    </Breadcrumbs>
  )
}

StandardBreadcrumb.propTypes = {
  crumbs: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.boolean,
      name: PropTypes.string,
    }).isRequired
  ),
}
