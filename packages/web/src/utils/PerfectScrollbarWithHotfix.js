import React, { useEffect } from 'react'
import PerfectScrollbar from 'react-perfect-scrollbar'

export const WrappedPerfectScrollbar = PerfectScrollbarWithHotfix =>
  // eslint-disable-next-line react/display-name
  React.forwardRef((props, ref) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      return () => {
        // To clear the scheduler at perfect-scrollbar/src/handlers/touch.js:176
        // bc PerfectScrollbar might be destroyed before the timer is up which led to null i.element
        if (ref && ref.current && ref.current._ps) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          ref.current._ps.isInitialized = true
        }
      }
    })
    return < PerfectScrollbarWithHotfix {...props} ref={ref}/>
  })

export const PerfectScrollbarWithHotfix = WrappedPerfectScrollbar(
  PerfectScrollbar
)
