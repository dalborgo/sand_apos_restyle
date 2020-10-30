import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import moment from 'moment'
import numeral from 'numeral'
import {
  Avatar,
  Box,
  Card,
  CardMedia,
  colors,
  Divider,
  Grid,
  IconButton,
  Link,
  makeStyles,
  SvgIcon,
  Tooltip,
  Typography,
} from '@material-ui/core'
import { Rating } from '@material-ui/lab'
import FavoriteIcon from '@material-ui/icons/Favorite'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import { Users as UsersIcon } from 'react-feather'
import getInitials from 'src/utils/getInitials'

const useStyles = makeStyles((theme) => ({
  root: {},
  image: {
    height: 200,
    backgroundColor: theme.palette.background.dark,
  },
  likedButton: {
    color: colors.red[600],
  },
  membersIcon: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
}))

const ProjectCard = ({ className, project, ...rest }) => {
  const classes = useStyles()
  const [isLiked, setLiked] = useState(project.isLiked)
  const [likesCount, setLikesCount] = useState(project.likesCount)
  
  const handleLike = () => {
    setLiked(true)
    setLikesCount((prevLikes) => prevLikes + 1)
  }
  
  const handleUnlike = () => {
    setLiked(false)
    setLikesCount((prevLikes) => prevLikes - 1)
  }
  
  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <Box p={3}>
        <CardMedia
          className={classes.image}
          image={project.image}
        />
        <Box
          alignItems="center"
          display="flex"
          mt={2}
        >
          <Avatar
            alt="Author"
            src={project.author.avatar}
          >
            {getInitials(project.author.name)}
          </Avatar>
          <Box ml={2}>
            <Link
              color="textPrimary"
              component={RouterLink}
              to="#"
              variant="h5"
            >
              {project.title}
            </Link>
            <Typography
              color="textSecondary"
              variant="body2"
            >
              by
              {' '}
              <Link
                color="textPrimary"
                component={RouterLink}
                to="#"
                variant="h6"
              >
                {project.author.name}
              </Link>
              {' '}
              | Updated
              {' '}
              {moment(project.updatedAt).fromNow()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        pb={2}
        px={3}
      >
        <Typography
          color="textSecondary"
          variant="body2"
        >
          {project.caption}
        </Typography>
      </Box>
      <Box
        px={3}
        py={2}
      >
        <Grid
          alignItems="center"
          container
          justify="space-between"
          spacing={3}
        >
          <Grid item>
            <Typography
              color="textPrimary"
              variant="h5"
            >
              {numeral(project.budget).format(`${project.currency}0,0.00`)}
            </Typography>
            <Typography
              color="textSecondary"
              variant="body2"
            >
              Budget
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              color="textPrimary"
              variant="h5"
            >
              {project.location}
            </Typography>
            <Typography
              color="textSecondary"
              variant="body2"
            >
              Location
            </Typography>
          </Grid>
          <Grid item>
            <Typography
              color="textPrimary"
              variant="h5"
            >
              {project.type}
            </Typography>
            <Typography
              color="textSecondary"
              variant="body2"
            >
              Type
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Divider/>
      <Box
        alignItems="center"
        display="flex"
        pl={2}
        pr={3}
        py={2}
      >
        {
          isLiked ?
            (
              <Tooltip title="Unlike">
                <IconButton
                  className={classes.likedButton}
                  onClick={handleUnlike}
                >
                  <FavoriteIcon fontSize="small"/>
                </IconButton>
              </Tooltip>
            ) :
            (
              <Tooltip title="Like">
                <IconButton onClick={handleLike}>
                  <FavoriteBorderIcon fontSize="small"/>
                </IconButton>
              </Tooltip>
            )
        }
        <Typography
          color="textSecondary"
          variant="subtitle2"
        >
          {likesCount}
        </Typography>
        <SvgIcon
          className={classes.membersIcon}
          color="action"
          fontSize="small"
        >
          <UsersIcon/>
        </SvgIcon>
        <Typography
          color="textSecondary"
          variant="subtitle2"
        >
          {project.membersCount}
        </Typography>
        <Box flexGrow={1}/>
        <Rating
          readOnly
          size="small"
          value={project.rating}
        />
      </Box>
    </Card>
  )
}

ProjectCard.propTypes = {
  className: PropTypes.string,
  project: PropTypes.object.isRequired,
}

export default ProjectCard
