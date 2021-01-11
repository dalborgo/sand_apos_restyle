export const isMenuLinkToShow = (item, payload = {}) => {
  const { priority } = payload
  let { private: private_ } = item
  const isPrivate = Boolean(private_)
  private_ = private_ && Array.isArray(private_) ? private_ : [private_]
  return !isPrivate || private_.includes(priority)
}

export const getEffectiveFetching = ({
  isFetching,
  isSuccess,
  isFetchedAfterMount,
}) => isFetching && (!isSuccess || isFetchedAfterMount)
