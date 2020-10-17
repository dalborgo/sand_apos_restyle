import axios from 'axios'

async function getVersion (connection = {}) {
  const { HOST } = connection
  const { data: results } = await axios.get(`http://${HOST}:8091/versions`)
  return { ok: true, results }
}

export default {
  getVersion,
}
