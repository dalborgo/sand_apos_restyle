import React, { useCallback, useMemo } from 'react'
import Page from 'src/components/Page'
import { Card, CardContent, Grid, makeStyles } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import DivContentWrapper from 'src/components/DivContentWrapper'
import FilesDropzone from 'src/components/FilesDropzone'
import { axiosLocalInstance, useSnackQueryError } from 'src/utils/reactQueryFunctions'
import { useSnackbar } from 'notistack'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
import { useHistory } from 'react-router-dom'
import { useParams } from 'react-router'
import StatusDialog from './StatusDialog'
import { parentPath } from 'src/utils/urlFunctions'
import ExportForm from './ExportForm'

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {// mobile
      padding: theme.spacing(0, 2),
    },
  },
}))
const baseUrl = '/app/management/import'
const loadingSel = state => ({ setLoading: state.setLoading })
const Import = () => {
  const classes = useStyles()
  const intl = useIntl()
  const { statusId } = useParams()
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const snackQueryError = useSnackQueryError()
  const closeDialog = useMemo(() => () => history.push(parentPath(history.location.pathname, -1)), [history])
  const handleUpload = useCallback(async files => {
    try {
      const [file] = files
      if (!file) {return}
      const formData = new FormData()
      formData.append('file', file)
      const { name } = file
      setLoading(true)
      const { data = {} } = await axiosLocalInstance.post('management/import', formData)
      setLoading(false)
      const { ok, message, errCode, results } = data
      if (!ok) {return enqueueSnackbar(intl.formatMessage(messages[`management_import_error_${errCode}`] || message, { name }))}
      const status = results.errors ? 'status_ko' : 'status_ok'
      history.push({
        pathname: `${baseUrl}/${status}`,
        state: {
          data: results,
        },
      })
    } catch (err) {
      setLoading(false)
      snackQueryError(err)
    }
  }, [enqueueSnackbar, history, intl, setLoading, snackQueryError])
  return (
    <Page
      title={intl.formatMessage(messages['menu_import'])}
    >
      <div className={classes.container}>
        <StandardHeader
          breadcrumb={
            <StandardBreadcrumb
              crumbs={[{ to: '/app', name: 'DashBoard' }, { name: intl.formatMessage(messages['sub_management']) }]}
            />
          }
        >
          <FormattedMessage defaultMessage="Import" id="management.import.header_title"/>
        </StandardHeader>
      </div>
      <DivContentWrapper>
        <Grid container spacing={4}>
          <Grid item sm={6}>
            <Card>
              <CardContent>
                <FilesDropzone handleUpload={handleUpload}/>
              </CardContent>
            </Card>
          </Grid>
          <Grid item sm={6}>
            <ExportForm/>
          </Grid>
        </Grid>
      </DivContentWrapper>
      {statusId && <StatusDialog close={closeDialog} statusId={statusId}/>}
    </Page>
  )
}

export default Import
