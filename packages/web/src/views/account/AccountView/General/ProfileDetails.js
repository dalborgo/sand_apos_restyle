import React from 'react'
import { Avatar, Box, Card, CardContent, makeStyles, Typography } from '@material-ui/core'
import { useRoleFormatter } from 'src/utils/formatters'

const useStyles = makeStyles((theme) => ({
  name: {
    marginTop: theme.spacing(1),
  },
  avatar: {
    height: 100,
    width: 100,
  },
}))

const ProfileDetails = ({ user }) => {
  const classes = useStyles()
  const roleFormatter = useRoleFormatter()
  return (
    <Card>
      <CardContent>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          textAlign="center"
        >
          <Avatar
            className={classes.avatar}
            src={`/static/images/avatars/${user.priority}.png`}
          />
          <Typography
            className={classes.name}
            color="textPrimary"
            gutterBottom
            variant="h3"
          >
            {user.display}
          </Typography>
          <Typography
            color="textPrimary"
            variant="body1"
          >
            {roleFormatter(user.priority)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ProfileDetails
