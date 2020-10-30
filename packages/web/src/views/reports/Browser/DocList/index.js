import React, { memo, useCallback } from 'react'
import useIntersectionObserver from 'src/utils/useIntersectionObserver'
import { useHistory } from 'react-router'
import { Button, Link, makeStyles } from '@material-ui/core'
import clsx from 'clsx'
import { testParams } from 'src/utils/urlFunctions'
import { FormattedMessage } from 'react-intl'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'

const BG_COLOR = '#c0efdd'

const useStyles = makeStyles((theme) => ({
  container: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  containerSelected: {
    backgroundColor: BG_COLOR,
    '&:hover': {
      backgroundColor: BG_COLOR,
    },
  },
  link: {
    display: 'inline-block',
  },
  linkPhone: {
    color: theme.palette.secondary.main,
  },
  linkServer: {
    color: theme.palette.grey['700'],
  },
  linkStandard: {
    color: theme.palette.text.primary,
  },
}), { name: 'MuiBrowserElem' })

const ListElem = ({ text, value, remove }) => {
  console.log('%cRENDER_SEC', 'color: pink')
  const classes = useStyles()
  const history = useHistory()
  const baseUrl = '/app/reports/browser'
  const handleSelect = useCallback(event => {
    const docId = event.currentTarget.id
    const params = testParams(`${baseUrl}/:docId`)
    if (!params || params['docId'] !== docId) {
      const elem = document.getElementById(docId)
      if (elem) {
        elem.classList.add('MuiBrowserElem-containerSelected')
        history.push(`${baseUrl}/${docId}`)
      }
    }
  }, [history])
  const handleRemove = useCallback(async event => {
    event.stopPropagation()
    event.persist()
    await remove(event.currentTarget.name)
  }, [remove])
  
  const params = testParams(`${baseUrl}/:docId`)
  let linkClasses = clsx(classes.link)
  let containerClasses = clsx(classes.container, { [classes.containerSelected]: params && params['docId'] === text })
  if (value) {
    const [first] = value
    linkClasses += ` ${clsx(first.includes('phone') ? classes.linkPhone : classes.linkServer)}`
  } else {
    linkClasses += ` ${clsx(classes.linkStandard)}`
  }
  return (
    <div className={containerClasses} id={text} onClick={handleSelect} style={{ whiteSpace: 'nowrap' }}>
      <IconButton
        name={text}
        onClick={handleRemove}
        size="small"
        style={{marginRight: 5}}
      >
        <CloseIcon/>
      </IconButton>
      <Link
        className={linkClasses}
        component={'div'}
        href="#"
        underline={'none'}
        variant="body2"
      >
        {text}
      </Link>
      <br/>
    </div>
  )
}

const DocList = memo(({ data, fetchMore, canFetchMore, isFetchingMore, remove }) => {
  console.log('%c****EXPENSIVE_RENDER_LIST', 'color: gold')
  const loadMoreButtonRef = React.useRef()
  useIntersectionObserver({
    target: loadMoreButtonRef,
    onIntersect: fetchMore,
    enabled: canFetchMore,
  })
  return (
    <div>
      {
        (data) &&
        data.map((page, i) => (
          <React.Fragment key={i}>
            {
              !!page?.results?.rows?.length && page.results.rows.map(elem => (
                <ListElem
                  key={elem.id}
                  remove={remove}
                  text={elem.id}
                  value={elem.value}
                />
              ))
            }
          </React.Fragment>
        ))
      }
      <div style={{ width: '100%', textAlign: 'center' }}>
        <Button
          color="primary"
          disabled={!!isFetchingMore}
          onClick={() => fetchMore()}
          ref={loadMoreButtonRef}
          size="small"
          style={
            {
              marginTop: 8,
              visibility: !canFetchMore ? 'hidden' : undefined,
            }
          }
        >
          <FormattedMessage defaultMessage="Mostra di più" id="reports.browser.showMore"/>
        </Button>
      </div>
    </div>
  )
})
DocList.displayName = 'DocList'
export default DocList
