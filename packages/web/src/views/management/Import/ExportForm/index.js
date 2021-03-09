import React, { memo, useCallback, useState } from 'react'
import { Grid, makeStyles, TextField } from '@material-ui/core'
import { useIntl } from 'react-intl'
import { messages } from 'src/translations/messages'
import Button from '@material-ui/core/Button'
import { axiosLocalInstance, useSnackQueryError } from 'src/utils/reactQueryFunctions'
import { saveAs } from 'file-saver'
import { useSnackbar } from 'notistack'
import { useGeneralStore } from 'src/zustandStore'
import shallow from 'zustand/shallow'
const OPTIONS = ['CATEGORY', 'PRODUCT']

const useStyles = makeStyles(theme => ({
  container: {
    marginTop: theme.spacing(2),
  },
  formControl: {
    backgroundColor: theme.palette.background.default,
  },
}))
const loadingSel = state => ({ setLoading: state.setLoading })
const ExportForm = () => {
  const classes = useStyles()
  const intl = useIntl()
  const { setLoading } = useGeneralStore(loadingSel, shallow)
  const { enqueueSnackbar } = useSnackbar()
  const snackQueryError = useSnackQueryError()
  const [state, setState] = useState({
    select: 'CATEGORY',
  })
  const handleChange = useCallback(event => {
    const name = event.target.name
    setState({
      ...state,
      [name]: event.target.value,
    })
  }, [state])
  const handleExport = useCallback(async () => {
    try {
      setLoading(true)
      const {
        data: {
          ok,
          results,
          message,
        },
      } = await axiosLocalInstance(`management/export/${state.select}`, {
        method: 'post',
      })
      setLoading(false)
      if (!ok) {return enqueueSnackbar(message)}
      const { base64, filename } = results
      saveAs(`data:application/pdf;base64,${base64}`, filename)
    } catch (err) {
      setLoading(false)
      snackQueryError(err)
    }
  }, [enqueueSnackbar, setLoading, snackQueryError, state.select])
  return (
    <div className={classes.container}>
      <Grid alignItems="center" container spacing={2}>
        <Grid item>
          <TextField
            className={classes.formControl}
            label={intl.formatMessage(messages['common_select'])}
            name="select"
            onChange={handleChange}
            onFocus={() => null}
            select
            SelectProps={
              {
                native: true,
              }
            }
            style={
              {
                minWidth: 250,
              }
            }
            value={state.select}
            variant="outlined"
          >
            {
              OPTIONS.map(val => (
                <option key={val} value={val}>
                  {intl.formatMessage(messages[`astenpos_type_${val}`])}
                </option>
              ))
            }
          </TextField>
        </Grid>
        <Grid item>
          <Button
            color="secondary"
            onClick={handleExport}
            size="small"
            variant="contained"
          >
            {intl.formatMessage(messages['common_exportTable'])}
          </Button>
        </Grid>
      </Grid>
    </div>
  )
}

export default memo(ExportForm)
