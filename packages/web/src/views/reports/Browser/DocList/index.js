import React, { memo, useCallback } from 'react'
import useIntersectionObserver from 'src/utils/useIntersectionObserver'
import { useHistory } from 'react-router'
import { Button, Link, makeStyles } from '@material-ui/core'
import clsx from 'clsx'
import { testParams } from 'src/utils/urlFunctions'

const BG_COLOR = '#c0efdd'

const useStyles = makeStyles((theme) => ({
  link: {
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  linkSelected: {
    backgroundColor: BG_COLOR,
    '&:hover': {
      backgroundColor: BG_COLOR,
    },
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

const ListElem = ({ text, value }) => {
  console.log('%cRENDER_SEC', 'color: pink')
  const classes = useStyles()
  const history = useHistory()
  const baseUrl = '/app/reports/browser'
  
  const handleSelect = useCallback(event => {
    const docId = event.target.id
    const params = testParams(`${baseUrl}/:docId`)
    if (params && params['docId'] !== docId) {
      const elem = document.getElementById(params.docId)
      if (elem) {elem.classList.remove('MuiBrowserElem-linkSelected')}
    }
    const elem = document.getElementById(docId)
    if (elem) {
      elem.classList.add('MuiBrowserElem-linkSelected')
      history.push(`${baseUrl}/${docId}`)
    }
  }, [history])
  
  const params = testParams(`${baseUrl}/:docId`)
  let className = clsx(classes.link, { [classes.linkSelected]: params && params['docId'] === text })
  if (value) {
    const [first] = value
    className += ` ${clsx(first.includes('phone') ? classes.linkPhone : classes.linkServer)}`
  } else {
    className += ` ${clsx(classes.linkStandard)}`
  }
  return (
    <Link
      className={className}
      component={'div'}
      href="#"
      id={text}
      onClick={handleSelect}
      underline={'none'}
      variant="body2"
    >
      {text}
    </Link>
  )
}

let DocList = memo(({ data, fetchMore, canFetchMore, isFetchingMore }) => {
  console.log('%cRENDER_LIST', 'color: orange')
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
          Carica ancora
        </Button>
      </div>
    </div>
  )
})
DocList.displayName = 'DocList'
export default DocList
