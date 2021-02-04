import React, { memo } from 'react'
import { useIntl } from 'react-intl'
import { SearchPanel } from '@devexpress/dx-react-grid-material-ui'
import { SearchInput } from '../SearchInput'
import { messages } from 'src/translations/messages'

const SearchPanelIntl = memo(function SearchPanelIntl () {
  const intl = useIntl()
  return (
    <SearchPanel
      inputComponent={SearchInput}
      messages={
        {
          searchPlaceholder: intl.formatMessage(messages['common_search']),
        }
      }
    />
  )
})

export default SearchPanelIntl
