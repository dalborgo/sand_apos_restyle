import React, { forwardRef } from 'react'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'
import useAuth from 'src/hooks/useAuth'

const Page = forwardRef(({
  children,
  title = '',
  ...rest
}, ref) => {
  const { selectedCode, user} = useAuth()
  const prefix = selectedCode?.name || user?.display
  return (
    <div
      ref={ref}
      {...rest}
    >
      <Helmet>
        <title>{`${prefix ? `${prefix} - ` : ''}`}{title}</title>
      </Helmet>
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
