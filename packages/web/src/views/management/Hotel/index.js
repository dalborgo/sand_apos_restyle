import React, { useCallback, useState } from 'react'
import Page from 'src/components/Page'
import { Box, Button, makeStyles, Paper, SvgIcon } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import DivContentWrapper from 'src/components/DivContentWrapper'
import { useQuery } from 'react-query'
import { axiosLocalInstance, useSnackQueryError } from 'src/utils/reactQueryFunctions'
import { getEffectiveFetchingWithPrev } from 'src/utils/logics'
import IconButtonLoader from 'src/components/IconButtonLoader'
import useAuth from 'src/hooks/useAuth'
import TableList from './TableList'
import { NO_SELECTED_CODE } from 'src/contexts/JWTAuthContext'
import { Redirect, useParams } from 'react-router'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import { useSnackbar } from 'notistack'
import { useHistory } from 'react-router-dom'
import StatusDialog from './StatusDialog'
import { useConfirm } from 'material-ui-confirm'
import { Upload as UploadIcon } from 'react-feather'

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
const baseUrl = '/app/management/hotel'
const loadingSel = state => ({ setLoading: state.setLoading })
const { gcSelect } = useGeneralStore.getState()
const Import = () => {
  const { selectedCode: { code: owner } } = useAuth()
  const hotelEnabled = Boolean((gcSelect(owner))?.hotelEnabled)
  const classes = useStyles()
  const confirm = useConfirm()
  const snackQueryError = useSnackQueryError()
  const [isRefetch, setIsRefetch] = useState(false)
  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()
  const { statusId } = useParams()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
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
  const alignHotel = useCallback(async () => {
    try {
      setLoading(true)
      await confirm({
        description: intl.formatMessage(messages['management_hotel_confirm_align_message']),
      })
      const { data } = await axiosLocalInstance('hotel/align', {
        method: 'post',
      })
      setLoading(false)
      if (!data.ok) {return enqueueSnackbar(data.message)}
      history.push({
        pathname: `${baseUrl}/status_ok`,
        state: {
          data: data.results,
        },
      })
    } catch (err) {
      setLoading(false)
      err && snackQueryError(err)
    }
  }, [confirm, enqueueSnackbar, history, intl, setLoading, snackQueryError])
  const effectiveFetching = getEffectiveFetchingWithPrev(rest, isRefetch)
  if (owner === NO_SELECTED_CODE || !hotelEnabled) {// attivo solo per singola struttura selezionata
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
                <Box mr={2}>
                  <IconButtonLoader
                    isFetching={effectiveFetching}
                    onClick={refetchOnClick}
                  />
                </Box>
                <Box>
                  <Button
                    color="secondary"
                    onClick={alignHotel}
                    size="small"
                    variant="contained"
                  >
                    <SvgIcon fontSize="small">
                      <UploadIcon/>
                    </SvgIcon>&nbsp;&nbsp;
                    {intl.formatMessage(messages['management_hotel_align_button'])}
                  </Button>
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
        {statusId && <StatusDialog refetchOnClick={refetchOnClick} statusId={statusId}/>}
      </Page>
    )
  }
}

export default Import
