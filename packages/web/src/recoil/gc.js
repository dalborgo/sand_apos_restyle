import { axiosLocalInstance } from 'src/utils/reactQueryFunctions'
import {selector} from 'recoil'
const gcQuery = selector({
  key: 'CurrentUserName',
  get: async () => {
    const response = await axiosLocalInstance.post('/api/queries/query_by_id', {
      id: 'general_configuration',
      columns: ['cover_default'],
    })
    return response?.data
  },
})

export default gcQuery
