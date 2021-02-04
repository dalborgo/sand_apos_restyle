import axios from 'axios'
import https from 'https'

async function getVersion (connection = {}) {
  const { DASHBOARD_URL } = connection.astConnection
  const { data: results } = await axios.get(`${DASHBOARD_URL}/versions`,
    {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    })
  return { ok: true, results }
}

export default {
  getVersion,
}
