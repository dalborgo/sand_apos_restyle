import React from 'react'
import { Avatar, Box, Card, makeStyles, Typography } from '@material-ui/core'
import { translations } from '@adapter/common'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDateFormatter, useMoneyFormatter } from 'src/utils/formatters'
import { useQuery } from 'react-query'
import useAuth from 'src/hooks/useAuth'
import { useGeneralStore } from '../../../zustandStore'
import { messages } from 'src/translations/messages'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    height: 48,
    width: 48,
    fontSize: theme.typography.pxToRem(24),
  },
}))

const BestEarning = () => {
  console.log('%cRENDER_BEST', 'color: pink')
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const intl = useIntl()
  const moneyFormatter = useMoneyFormatter()
  const dateFormatter = useDateFormatter()
  const { data } = useQuery(['stats/best_earning', { owner }], {
    notifyOnChangeProps: ['data', 'error'],
    suspense: true,
  })
  const companyData = useGeneralStore.getState().companyData
  const isSingleCompany = Object.keys(companyData).length < 2
  if (data?.ok) {
    const [value, date, owner] = data.results || [0]
    return (
      <Card
        className={classes.root}
      >
        <Box flexGrow={1}>
          <Typography
            color="textSecondary"
            component="h3"
            gutterBottom
            variant="overline"
          >
            <FormattedMessage defaultMessage="Miglior Guadagno" id="reports.dashboard.best_earning"/>
          </Typography>
          <Typography
            color="textPrimary"
            variant="h6"
          >
            {isSingleCompany ? intl.formatMessage(messages['common_total']) : companyData[owner].name}
          </Typography>
          <Typography
            color="textPrimary"
            variant="h3"
          >
            {moneyFormatter(value)}
          </Typography>
          <Typography
            color="textPrimary"
            style={{textTransform: 'capitalize'}}
            variant="h6"
          >
            {
              dateFormatter(date, { month: 'long', weekday: 'long' })
            }
          </Typography>
        </Box>
        <Avatar className={classes.avatar}>
          {translations.getSymbolFromLocale(intl.locale)}
        </Avatar>
      </Card>
    )
  } else {
    return null
  }
}

export default BestEarning
