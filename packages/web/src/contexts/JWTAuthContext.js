import React, { createContext, useEffect, useReducer } from 'react'
import jwtDecode from 'jwt-decode'
import SplashScreen from 'src/components/SplashScreen'
import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'
import manageQueryCache from 'src/utils/cache'
import log from '@adapter/common/src/log'
import { useQueryCache } from 'react-query'

export const NO_SELECTED_CODE = 'All'

const initialAuthState = {
  codes: [],
  isAuthenticated: false,
  isInitialised: false,
  selectedCode: null,
  user: null,
}

const isValidToken = accessToken => {
  if (!accessToken) {
    return false
  }
  const decoded = jwtDecode(accessToken)
  const currentTime = Date.now() / 1000
  return decoded.exp > currentTime
}


const setSession = ({ codes, accessToken, selectedCode }) => {
  if (accessToken || selectedCode) {
    accessToken && localStorage.setItem('accessToken', accessToken)
    accessToken && (axiosLocalInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`)
    selectedCode && localStorage.setItem('selectedCode', selectedCode)
    const selectedCode_ = selectedCode || localStorage.getItem('selectedCode')
    axiosLocalInstance.defaults.params = {
      _key: 'astenposServer',
      owner: selectedCode_ !== NO_SELECTED_CODE ? selectedCode_ : codes,
    }
  } else {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('selectedCode')
    delete axiosLocalInstance.defaults.headers.common.Authorization
    axiosLocalInstance.defaults.params = { //reset to default
      _key: 'astenposServer',
    }
  }
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIALISE': {
      const { isAuthenticated, user, codes, selectedCode } = action.payload
      return {
        ...state,
        codes,
        isAuthenticated,
        isInitialised: true,
        selectedCode,
        user,
      }
    }
    case 'LOGIN': {
      const { user, codes, selectedCode } = action.payload
      return {
        ...state,
        codes,
        isAuthenticated: true,
        selectedCode,
        user,
      }
    }
    case 'CHANGE_CODE': {
      const { selectedCode } = action.payload
      return {
        ...state,
        selectedCode,
      }
    }
    case 'LOGOUT': {
      return {
        ...state,
        codes: [],
        isAuthenticated: false,
        selectedCode: '',
        user: null,
      }
    }
    default: {
      return { ...state }
    }
  }
}

const AuthContext = createContext({
  ...initialAuthState,
  method: 'JWT',
  login: () => Promise.resolve(),
  logout: () => { },
  changeCode: () => { },
})

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState)
  const queryCache = useQueryCache()
  const login = async (username, password) => {
    const response = await axiosLocalInstance.post('/api/jwt/login', { username, password })
    const { accessToken, user, codes } = response.data
    const selectedCode = codes?.length === 1 ? codes[0] : NO_SELECTED_CODE
    setSession({ codes, accessToken, selectedCode })
    dispatch({
      type: 'LOGIN',
      payload: {
        codes,
        selectedCode,
        user,
      },
    })
  }
  
  const logout = () => {
    setSession({})
    queryCache.clear()
    dispatch({ type: 'LOGOUT' })
  }
  const changeCode = selectedCode => {
    manageQueryCache(queryCache)
    setSession({ codes: state.codes, selectedCode })
    dispatch({
      type: 'CHANGE_CODE',
      payload: {
        selectedCode,
      },
    })
  }
  
  useEffect(() => {
    const initialise = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken')
        
        if (accessToken && isValidToken(accessToken)) {
          setSession({ accessToken })
          const response = await axiosLocalInstance.get('/api/jwt/me')
          const { user, codes } = response.data
          let selectedCode = window.localStorage.getItem('selectedCode')
          if (!codes?.includes(selectedCode)) {
            selectedCode = codes?.length === 1 ? codes[0] : NO_SELECTED_CODE
            setSession({ codes, selectedCode })
          }
          dispatch({
            type: 'INITIALISE',
            payload: {
              codes,
              isAuthenticated: true,
              selectedCode,
              user,
            },
          })
        } else {
          dispatch({
            type: 'INITIALISE',
            payload: {
              codes: [],
              isAuthenticated: false,
              selectedCode: null,
              user: null,
            },
          })
        }
      } catch (err) {
        log.error(err)
        dispatch({
          type: 'INITIALISE',
          payload: {
            initialData: [],
            isAuthenticated: false,
            selectedCode: null,
            user: null,
          },
        })
      }
    }
    initialise().then()
  }, [])
  
  if (!state.isInitialised) {
    return <SplashScreen/>
  }
  
  return (
    <AuthContext.Provider
      value={
        {
          ...state,
          method: 'JWT',
          login,
          logout,
          changeCode,
        }
      }
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
