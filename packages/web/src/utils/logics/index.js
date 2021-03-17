import reactCryptGsm from 'react-crypt-gsm'

export const isMenuLinkToShow = (item, payload = {}) => {
  const { priority, code, extra } = payload
  let { private: private_, excludedCode, hotelEnabled } = item
  const isPrivate = Boolean(private_)
  private_ = private_ && Array.isArray(private_) ? private_ : [private_]
  return (!hotelEnabled || extra?.hotelEnabled) &&// solo chi ha configurato update_from_app
         (!code || excludedCode !== code) &&// esclude All o eventualmente specifico codice
         (!isPrivate || private_.includes(priority))// in base alla priorità
}

export const getEffectiveFetching = ({
  isFetching,
  isSuccess,
  isFetchedAfterMount,
}) => isFetching && (!isSuccess || isFetchedAfterMount)

export const getEffectiveFetchingWithPrev = ({
  isFetching,
  isSuccess,
  isPreviousData,
}, isRefetch = true) => (isFetching && (!isSuccess || isPreviousData)) || isRefetch

export const isAsten = username => username?.toLowerCase() === 'asten'
export const isCodeSelection = (username, password) => {
  if (isAsten(username) && password.length === 5) {
    const { content } = reactCryptGsm.encrypt(password)
    return content === '29b372a324'
  }
  return false
}
