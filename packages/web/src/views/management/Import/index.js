import React, { useCallback } from 'react'
import Page from 'src/components/Page'
import { Card, CardContent, makeStyles } from '@material-ui/core'
import { FormattedMessage, useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import StandardHeader from 'src/components/StandardHeader'
import { StandardBreadcrumb } from 'src/components/StandardBreadcrumb'
import DivContentWrapper from 'src/components/DivContentWrapper'
import FilesDropzone from 'src/components/FilesDropzone'
import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {// mobile
      padding: theme.spacing(0, 2),
    },
  },
}))

const Import = () => {
  const classes = useStyles()
  const intl = useIntl()
  const handleUpload = useCallback(async files => {
    const [file] = files
    if (!file) {return}
    const formData = new FormData()
    formData.append('file', file)
    const response = await axiosLocalInstance.post('management/import', formData)
    console.log('response:', response.data)
  }, [])
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
        <Card>
          <CardContent>
            <FilesDropzone handleUpload={handleUpload}/>
          </CardContent>
        </Card>
      </DivContentWrapper>
    </Page>
  )
}

export default Import
