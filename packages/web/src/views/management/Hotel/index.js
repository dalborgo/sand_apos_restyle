import React, { useCallback, useState } from 'react'
import Page from 'src/components/Page'
import { Box, makeStyles, Paper } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import DivContentWrapper from 'src/components/DivContentWrapper'
import { useQuery } from 'react-query'
import { useSnackQueryError } from 'src/utils/reactQueryFunctions'
import { getEffectiveFetchingWithPrev } from 'src/utils/logics'
import IconButtonLoader from 'src/components/IconButtonLoader'
import useAuth from 'src/hooks/useAuth'
import TableList from './TableList'
import { NO_SELECTED_CODE } from 'src/contexts/JWTAuthContext'
import { Redirect } from 'react-router'

const useStyles = makeStyles(theme => ({
  paper: {
    height: '100%',
  },
  container: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {// mobile
      padding: theme.spacing(0, 2, 2),
    },
  },
}))

const Import = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const classes = useStyles()
  const snackQueryError = useSnackQueryError()
  const [isRefetch, setIsRefetch] = useState(false)
  const intl = useIntl()
  const { data, refetch, ...rest } = useQuery(['hotel/align_preview', { owner }], {
    keepPreviousData: true,
    notifyOnChangeProps: ['data', 'error'],
    onError: snackQueryError,
  })
  const refetchOnClick = useCallback(async () => {
    setIsRefetch(true)
    await refetch()
    setIsRefetch(false)
  }, [refetch])
  const effectiveFetching = getEffectiveFetchingWithPrev(rest, isRefetch)
  if (owner === NO_SELECTED_CODE) {// attivo solo per singola struttura selezionata
    return <Redirect to="/app"/>
  } else {
    return (
      <Page
        title={intl.formatMessage(messages['menu_hotel'])}
      >
        <div className={classes.container}>
          <StandardHeader
            breadcrumb={
              <StandardBreadcrumb
                crumbs={[{ to: '/app', name: 'Home' }, { name: intl.formatMessage(messages['sub_management']) }]}
              />
            }
            rightComponent={
              <Box alignItems="center" display="flex">
                <Box>
                  <IconButtonLoader
                    isFetching={effectiveFetching}
                    onClick={refetchOnClick}
                  />
                </Box>
              </Box>
            }
          >
            <FormattedMessage defaultMessage="Hotel" id="management.hotel.header_title"/>
          </StandardHeader>
        </div>
        <DivContentWrapper>
          <Paper className={classes.paper}>
            <TableList
              isFetching={effectiveFetching && !data?.results?.length}
              isIdle={rest.isIdle}
              rows={data?.results || []}
            />
          </Paper>
        </DivContentWrapper>
      </Page>
    )
  }
}

export default Import
