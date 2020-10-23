import React from 'react'
import useIntersectionObserver from 'src/utils/useIntersectionObserver'
import { Button, Link, makeStyles } from '@material-ui/core'
import clsx from 'clsx'

const useStyles = makeStyles((theme) => ({
  link: {
    cursor: 'pointer',
    whiteSpace: 'nowrap',
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
}))

function ListElem ({ text, value }) {
  const classes = useStyles()
  let className
  if (value) {
    const [first] = value
    className = clsx(classes.link, first.includes('phone') ? classes.linkPhone : classes.linkServer)
  } else {
    className = clsx(classes.link, classes.linkStandard)
  }
  const preventDefault = (event) => event.preventDefault()
  return (
    <Link
      className={className}
      component={'div'}
      href="#"
      onClick={preventDefault}
      variant="body2"
    >
      {text}
    </Link>
  )
}

const DocList = ({ data, fetchMore, canFetchMore, isFetchingMore }) => {
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
      <div style={{width:'100%',  textAlign: 'center'}}>
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
}

export default DocList
