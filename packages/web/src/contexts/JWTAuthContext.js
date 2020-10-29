import React, { createContext, useEffect, useReducer } from 'react'
import jwtDecode from 'jwt-decode'
import SplashScreen from 'src/components/SplashScreen'
import {axiosLocalInstance} from 'src/utils/reactQueryFunctions'
import log from '@adapter/common/src/log'
const initialAuthState = {
  isAuthenticated: false,
  isInitialised: false,
  user: null,
}

const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false
  }
  const decoded = jwtDecode(accessToken)
  const currentTime = Date.now() / 1000
  return decoded.exp > currentTime
}

const setSession = (accessToken) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken)
    axiosLocalInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`
    axiosLocalInstance.defaults.params = {
      _key: 'astenposServer',
    }
  } else {
    localStorage.removeItem('accessToken')
    delete axiosLocalInstance.defaults.headers.common.Authorization
  }
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIALISE': {
      const { isAuthenticated, user } = action.payload
      return {
        ...state,
        isAuthenticated,
        isInitialised: true,
        user,
      }
    }
    case 'LOGIN': {
      const { user } = action.payload
      
      return {
        ...state,
        isAuthenticated: true,
        user,
      }
    }
    case 'LOGOUT': {
      return {
        ...state,
        isAuthenticated: false,
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
})

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState)
  
  const login = async (username, password) => {
    const response = await axiosLocalInstance.post('/api/jwt/login', { username, password })
    const { accessToken, user } = response.data
    
    setSession(accessToken)
    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    })
  }
  
  const logout = () => {
    setSession(null)
    dispatch({ type: 'LOGOUT' })
  }
  
  useEffect(() => {
    const initialise = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken')
        
        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken)
          
          const response = await axiosLocalInstance.get('/api/jwt/me')
          const { user } = response.data
          
          dispatch({
            type: 'INITIALISE',
            payload: {
              isAuthenticated: true,
              user,
            },
          })
        } else {
          dispatch({
            type: 'INITIALISE',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          })
        }
      } catch (err) {
        log.error(err)
        dispatch({
          type: 'INITIALISE',
          payload: {
            isAuthenticated: false,
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
        }
      }
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
