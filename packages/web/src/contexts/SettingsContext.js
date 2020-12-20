import React, { createContext, useEffect, useState } from 'react'
import merge from 'lodash/merge'
import { THEMES } from 'src/constants'
import log from '@adapter/common/src/log'
const defaultSettings = {
  direction: 'ltr',
  responsiveFontSizes: true,
  theme: THEMES.LIGHT,
}

export const restoreSettings = () => {
  let settings = null
  
  try {
    const storedData = window.localStorage.getItem('settings')
    
    if (storedData) {
      settings = JSON.parse(storedData)
    }
    log.info('Locale:', settings?.locale)
  } catch (err) {
    log.error('restoreSettings', err.message)
    // If stored data is not a stringified JSON this will fail,
    // that's why we catch the error
  }
  
  return settings
}

export const storeSettings = (settings) => {
  window.localStorage.setItem('settings', JSON.stringify(settings))
}

const SettingsContext = createContext({
  settings: defaultSettings,
  saveSettings: () => { },
})

export const SettingsProvider = ({ settings, children }) => {
  const [currentSettings, setCurrentSettings] = useState(settings || defaultSettings)
  
  const handleSaveSettings = (update = {}) => {
    const mergedSettings = merge({}, currentSettings, update)
    
    setCurrentSettings(mergedSettings)
    storeSettings(mergedSettings)
  }
  
  useEffect(() => {
    const restoredSettings = restoreSettings()
    
    if (restoredSettings) {
      setCurrentSettings(restoredSettings)
    }
  }, [])
  
  useEffect(() => {
    document.dir = currentSettings.direction
  }, [currentSettings])
  
  return (
    <SettingsContext.Provider
      value={
        {
          settings: currentSettings,
          saveSettings: handleSaveSettings,
        }
      }
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const SettingsConsumer = SettingsContext.Consumer

export default SettingsContext
