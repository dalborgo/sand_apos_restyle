import React, { createContext, useEffect, useReducer } from 'react'
import jwtDecode from 'jwt-decode'
import SplashScreen from 'src/components/SplashScreen'
import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'
import log from '@adapter/common/src/log'

const initialAuthState = {
  codes: [],
  selectedCode: 'All',
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
    axiosLocalInstance.defaults.params = { //reset to default
      _key: 'astenposServer',
    }
  }
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIALISE': {
      const { isAuthenticated, user, codes } = action.payload
      return {
        ...state,
        codes,
        isAuthenticated,
        isInitialised: true,
        user,
      }
    }
    case 'LOGIN': {
      const { user, codes } = action.payload
      
      return {
        ...state,
        codes,
        isAuthenticated: true,
        user,
      }
    }
    case 'CHANGE_CODE': {
      const { code } = action.payload
      
      return {
        ...state,
        code,
      }
    }
    case 'LOGOUT': {
      return {
        ...state,
        codes: [],
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
  changeCode: () => { },
})

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState)
  
  const login = async (username, password) => {
    const response = await axiosLocalInstance.post('/api/jwt/login', { username, password })
    const { accessToken, user, codes } = response.data
    
    setSession(accessToken)
    dispatch({
      type: 'LOGIN',
      payload: {
        codes,
        user,
      },
    })
  }
  
  const logout = () => {
    setSession(null)
    dispatch({ type: 'LOGOUT' })
  }
  const changeCode = code => {
    console.log('code:', code)
    /*dispatch({
      type: 'CHANGE_CODE',
      payload: {
        code,
      },
    })*/
  }
  
  useEffect(() => {
    const initialise = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken')
        
        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken)
          
          const response = await axiosLocalInstance.get('/api/jwt/me')
          const { user, codes } = response.data
          
          dispatch({
            type: 'INITIALISE',
            payload: {
              codes,
              isAuthenticated: true,
              user,
            },
          })
        } else {
          dispatch({
            type: 'INITIALISE',
            payload: {
              codes: [],
              isAuthenticated: false,
              selectedCode: 'All',
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
            selectedCode: 'All',
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
