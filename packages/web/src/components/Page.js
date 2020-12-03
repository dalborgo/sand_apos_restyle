import React, { forwardRef } from 'react'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'
import useAuth from 'src/hooks/useAuth'
import { LinearProgress } from '@material-ui/core'
import { useGeneralStore } from 'src/zustandStore'

const Page = forwardRef(({
  children,
  title = '',
  ...rest
}, ref) => {
  const { selectedCode, user } = useAuth()
  const loading = useGeneralStore(state => state.loading)
  const prefix = selectedCode?.name || user?.display
  return (
    <div
      ref={ref}
      {...rest}
    >
      <Helmet>
        <title>{`${prefix ? `${prefix} - ` : ''}`}{title}</title>
      </Helmet>
      {loading ? <LinearProgress/> : <div style={{ height: 4 }}/>}
      {children}
    </div>
  )
})

Page.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
}

Page.displayName = 'PageComponent'

export default Page
