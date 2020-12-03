export const isMenuLinkToShow = (item, payload = {}) => {
  const { priority } = payload
  const isPrivate = Array.isArray(item.private)
  return !isPrivate || item.private.includes(priority)
}

export const getEffectiveFetching = ({
  isFetching,
  isSuccess,
  isFetchedAfterMount
}) => isFetching && (!isSuccess || isFetchedAfterMount)
