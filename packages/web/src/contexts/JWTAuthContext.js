import React, { createContext, useEffect, useReducer } from 'react'
import jwtDecode from 'jwt-decode'
import SplashScreen from 'src/components/SplashScreen'
import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'
import log from '@adapter/common/src/log'
import { useQueryClient } from 'react-query'
import find from 'lodash/find'
import * as stores from 'src/zustandStore'
import useGeneralStore from 'src/zustandStore/useGeneralStore'
import keyBy from 'lodash/keyBy'
import useSettings from 'src/hooks/useSettings'

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
    accessToken && window.localStorage.setItem('accessToken', accessToken)
    accessToken && (axiosLocalInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`)
    selectedCode && window.localStorage.setItem('selectedCode', JSON.stringify(selectedCode))
    let selectedCode_ = selectedCode
    if (!selectedCode_) {
      const jsonObj = window.localStorage.getItem('selectedCode')
      if (jsonObj) {selectedCode_ = JSON.parse(jsonObj)}
    }
    axiosLocalInstance.defaults.params = {
      _key: 'astenposServer',
      owner: selectedCode_?.code !== NO_SELECTED_CODE ? selectedCode_.code : codes?.map(code => code.code),
    }
  } else {
    window.localStorage.removeItem('accessToken')
    window.localStorage.removeItem('selectedCode')
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

function clearAllStores () {
  for (let key in stores) {
    stores[key].getState().reset()
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialAuthState)
  const queryClient = useQueryClient()
  const { saveSettings, settings } = useSettings()
  const login = async (username, password, code) => {
    const response = await axiosLocalInstance.post('/api/jwt/login', { username, password, code })
    const { accessToken, user, codes, locales } = response.data
    if (locales.length) {
      const [locale] = locales
      if (!settings.locale || !locales.includes(settings.locale)) {
        saveSettings({ locale })
      }
    }
    const selectedCode = codes?.length === 1 ? codes[0] : { code: NO_SELECTED_CODE }
    setSession({ codes, accessToken, selectedCode })
    useGeneralStore.setState({ priority: user.priority, companyData: keyBy(codes, 'code'), locales })
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
    clearAllStores()
    queryClient.clear()
    dispatch({ type: 'LOGOUT' })
  }
  const changeCode = selectedCode => {
    const code_ = find(state.codes, { code: selectedCode })
    const code = code_ ? code_ : { code: NO_SELECTED_CODE }
    setSession({ codes: state.codes, selectedCode: code })
    dispatch({
      type: 'CHANGE_CODE',
      payload: {
        selectedCode: code,
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
          let { user, codes, locales } = response.data
          let selectedCode = window.localStorage.getItem('selectedCode')
          if (selectedCode) {selectedCode = JSON.parse(selectedCode)}
          codes = codes ? codes : [selectedCode]
          if (!find(codes, { code: selectedCode?.code })) { //refresh with all code
            selectedCode = codes?.length === 1 ? codes[0] : { code: NO_SELECTED_CODE }
            setSession({ codes, selectedCode })
          }
          useGeneralStore.setState({ priority: user.priority, companyData: keyBy(codes, 'code'), locales })
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
