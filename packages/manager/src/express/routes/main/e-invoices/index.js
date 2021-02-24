import config from 'config'
import eInvoiceAuth, { authStates } from './eInvoiceClass'
import { createEInvoiceXML, getInvoiceStatus } from './utils'
import log from '@adapter/common/src/winston'
import { couchQueries } from '@adapter/io'
import moment from 'moment'
import archiver from 'archiver'
import { createSetStatement, updateById } from '../queries'
import get from 'lodash/get'

const MOCK_REFUSE = {
  count: 1,
  notifications: [
    {
      filename: 'IT01879020517_gi0zb_NS_001.xml',
      number: null,
      notificationDate: null,
      docType: 'NS',
      date: '2019-02-04T16:58:56.000+0000',
      invoiceId: '5c581920a0d615179005af0b',
      file: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48bnMzOlJpY2V2dXRhU2NhcnRvIHhtbG5zOm5zMz0iaHR0cDovL2l2YXNlcnZpemkuYWdlbnppYWVudHJhdGUuZ292Lml0L2RvY3MveHNkL2ZhdHR1cmEvbWVzc2FnZ2kvdjEuMCIgeG1sbnM6bnMyPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjIiB2ZXJzaW9uZT0iMS4wIj4KICAgIDxJZGVudGlmaWNhdGl2b1NkST4yNzEwNTQ4NzE8L0lkZW50aWZpY2F0aXZvU2RJPgogICAgPE5vbWVGaWxlPklUMDE4NzkwMjA1MTdfZ2kwemIueG1sLnA3bTwvTm9tZUZpbGU+CiAgICA8SGFzaD5hMmIxNmQyMjg1MmQ3MDg2YTk2Y2M5ZTUwMjkxMDk0ZDQ5NjNhZGJhMjc3ZGUyZjg4ZTc5YmE4MzI3YzE5YTY0PC9IYXNoPgogICAgPERhdGFPcmFSaWNlemlvbmU+MjAxOS0wMi0wNFQxNzo1ODo1Ni4wMDArMDE6MDA8L0RhdGFPcmFSaWNlemlvbmU+CiAgICA8TGlzdGFFcnJvcmk+CiAgICAgICAgPEVycm9yZT4KICAgICAgICAgICAgPENvZGljZT4wMDMwNTwvQ29kaWNlPgogICAgICAgICAgICA8RGVzY3JpemlvbmU+MS40LjEuMS4yIElkQ29kaWNlIG5vbiB2YWxpZG8gOiAwMDAwMDAwMDAwMDwvRGVzY3JpemlvbmU+CiAgICAgICAgICAgIDxTdWdnZXJpbWVudG8+VmVyaWZpY2FyZSBjaGUgaWwgY2FtcG8gSWRGaXNjYWxlSVZBL0lkQ29kaWNlIGRlbCAiQ2Vzc2lvbmFyaW9Db21taXR0ZW50ZSIgc2lhIHZhbGlkbzwvU3VnZ2VyaW1lbnRvPgogICAgICAgIDwvRXJyb3JlPgogICAgPC9MaXN0YUVycm9yaT4KICAgIDxNZXNzYWdlSWQ+MTQ0MTc2NjQ3MTwvTWVzc2FnZUlkPgo8ZHM6U2lnbmF0dXJlIHhtbG5zOmRzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjIiBJZD0iU2lnbmF0dXJlMSI+PGRzOlNpZ25lZEluZm8+PGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz48ZHM6U2lnbmF0dXJlTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxkc2lnLW1vcmUjcnNhLXNoYTI1NiIvPjxkczpSZWZlcmVuY2UgSWQ9InJlZmVyZW5jZS1kb2N1bWVudCIgVVJJPSIiPjxkczpUcmFuc2Zvcm1zPjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAyLzA2L3htbGRzaWctZmlsdGVyMiI+PFhQYXRoIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAyLzA2L3htbGRzaWctZmlsdGVyMiIgRmlsdGVyPSJzdWJ0cmFjdCI+L2Rlc2NlbmRhbnQ6OmRzOlNpZ25hdHVyZTwvWFBhdGg+PC9kczpUcmFuc2Zvcm0+PC9kczpUcmFuc2Zvcm1zPjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz48ZHM6RGlnZXN0VmFsdWU+eU1FOXBRK01melhsY2ZUZkFlUGc0d0taZVhIWmdWSWxqWVZ4YjZiTDNNQT08L2RzOkRpZ2VzdFZhbHVlPjwvZHM6UmVmZXJlbmNlPjxkczpSZWZlcmVuY2UgSWQ9InJlZmVyZW5jZS1zaWduZWRwcm9wZXRpZXMiIFR5cGU9Imh0dHA6Ly91cmkuZXRzaS5vcmcvMDE5MDMjU2lnbmVkUHJvcGVydGllcyIgVVJJPSIjU2lnbmVkUHJvcGVydGllc18xIj48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzOkRpZ2VzdFZhbHVlPkF5VVdkWEc5S1czUXI1c2R2ZGVtcHNnaUF5REdZSGwxR1Y1d1ZTeWRqWVE9PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48ZHM6UmVmZXJlbmNlIElkPSJyZWZlcmVuY2Uta2V5aW5mbyIgVVJJPSIjS2V5SW5mb0lkIj48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzOkRpZ2VzdFZhbHVlPmZITExQWFc3ZVVHbnRFdDQzK1RSUDJLMVp1aWZ3TmdoRjU4SEFBaUsyek09PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48L2RzOlNpZ25lZEluZm8+PGRzOlNpZ25hdHVyZVZhbHVlIElkPSJTaWduYXR1cmVWYWx1ZTEiPllCVjQ2MlhwOFhvZWQ5bnRHUGtxck9qRG9pclhxNFROVlJDSlZwZldUSGg1aDF4S0VPVXYwTkQvVDVXUzdDditOQUNHTzk0TEZYdFAKZCtOUXBWWkJNMk5nWTh1WTBQTHRpc3UyekZvSkorMldaU1pZeEp0OEt3ZzlHZk5FMXdIK1gyaTBYS1I2NHl0VTQvQXdJcWVpb3BVRwpBZ3JxWnRFenRvUU1HaTlZR0NaRi9FYWEvTStrZVhzRVFMR3gzd09wMW12RGhXeWRRSmlSUVNFbHVVNXZLWXBxV3ExUVVjWFJ0MlJnCnJGczRGTjd0R3N3RUd2MUc1QlA4Wm5FWTZVeWVhM1h4NzhtZGNiYmVjNzlqUk16N0RUcjBQdC92N3QzUU1oZUJ4UEVPd1RYelgvd08KT0p3ZERhOWpLdGs1ZWdPUUJzNU5FVWkxOFprVG15Q0YwbzBDM0E9PTwvZHM6U2lnbmF0dXJlVmFsdWU+PGRzOktleUluZm8gSWQ9IktleUluZm9JZCI+PGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU+TUlJRVpUQ0NBMDJnQXdJQkFnSUlUUG45dXR5eTJHTXdEUVlKS29aSWh2Y05BUUVMQlFBd2JURUxNQWtHQTFVRUJoTUNTVlF4SGpBYwpCZ05WQkFvVEZVRm5aVzU2YVdFZ1pHVnNiR1VnUlc1MGNtRjBaVEViTUJrR0ExVUVDeE1TVTJWeWRtbDZhU0JVWld4bGJXRjBhV05wCk1TRXdId1lEVlFRREV4aERRU0JCWjJWdWVtbGhJR1JsYkd4bElFVnVkSEpoZEdVd0hoY05NVGN3TlRJME1USXpOREUzV2hjTk1qQXcKTlRJME1USXpOREUzV2pCME1Rc3dDUVlEVlFRR0V3SkpWREVlTUJ3R0ExVUVDZ3dWUVdkbGJucHBZU0JrWld4c1pTQkZiblJ5WVhSbApNUnN3R1FZRFZRUUxEQkpUWlhKMmFYcHBJRlJsYkdWdFlYUnBZMmt4S0RBbUJnTlZCQU1NSDFOcGMzUmxiV0VnU1c1MFpYSnpZMkZ0ClltbHZJRVpoZEhSMWNtRWdVRUV3Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRQ0xKUVpITE1lN1B5YlcKc3RiL3NMdjBrazhkZXdSZERaNFZEQVd0eHVFN0FPQ1h6U2V1VE9qM1JMVzNWNTNqWVlMbmp2VUZPNHYvcTgvWTcwc0crRDkvM3h0Nwo3RTRRK215NDJxZkduakRGYTVDTk52bW0vQmg3MDdrLzhSVlF0YURtRk5DdTBxcSt6OGxrOU5xeStyd0VYN2ZQSjVNMGEzaks0YWxICjFQMjV0aEVHRkhzSmk1MXN3dWRkVzJqYzVUTExwRGNlNmRNQUZ1N3lzUlFjb3NYRUtPcFk5ekdpbVo1MW0rZW1YMWNHYTJzVXB1R0YKVllyUnl3ZDk3dHJVKzhxUG12SmxZVWxTVjNoMDVUWlc2aW1ydmpvbk8zazJiSElqbmsvdHRrZE5vTzVrcDBQZVVOMFhWQUVIaStmWgo2cThMZkpRSlpQSlY2allGcXg2T2p5ZWhBZ01CQUFHamdnRUFNSUg5TUI4R0ExVWRJd1FZTUJhQUZPcEVQeDhaNHpjK3E2cVVncVdmCjYvd1d1bisxTUlHcUJnTlZIUjhFZ2FJd2daOHdnWnlnZ1ptZ2daYUdnWk5zWkdGd09pOHZZMkZrY3k1bGJuUnlZWFJsTG1acGJtRnUKZW1VdWFYUXZRMDQ5UTBFbE1qQkJaMlZ1ZW1saEpUSXdaR1ZzYkdVbE1qQkZiblJ5WVhSbExFOVZQVk5sY25acGVta2xNakJVWld4bApiV0YwYVdOcExFODlRV2RsYm5wcFlTVXlNR1JsYkd4bEpUSXdSVzUwY21GMFpTeERQV2wwUDJObGNuUnBabWxqWVhSbFVtVjJiMk5oCmRHbHZia3hwYzNRd0hRWURWUjBPQkJZRUZQdng0ZHM3aDhIUmdVcGI0WWJBWS9uVlovT3FNQTRHQTFVZER3RUIvd1FFQXdJR1FEQU4KQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBTXAyRVlSMjVXTGxWQmJmMm1VS3hWSndOMC96a0VjOEVqejBwbzVSVE11c2tqYmJVMUpSMQp0NzJQRFROVkFrdW91ajNYNkZ4OFRpTzZDYUVHOVNoR2RKSG9zTXdla2o1UzdJcWQweFM2NktsS3VRa21QeUhCUGd1UzIvV0xkTGlUCklGbjVKOGhuS1VyWHpPcjQ4czQ4SzVpWTRRY0ZjQTZ3YTJQY21MbUJGai91UkhxemRyd1BtWTBvckVaa0pvOVpoK1cxL0JDTVZHTCsKQWk1ajV2YVRtY1JVNGQ2ejdUZWtyZlN0aGp4YVlZMXY4UFZlUzZZT3BZYjJNd1BYcjlNUG0vNGNwUDJ0WnFodFdGUmtVaHFCVlE2OQpOZis2clNoTlJOazlrd1dneVF2dUpJNHk1MGQ1dGNNdmNhNnRpbjRXenJIb2U2STIrRHRWcFF4eDV3dHZaZz09PC9kczpYNTA5Q2VydGlmaWNhdGU+PC9kczpYNTA5RGF0YT48L2RzOktleUluZm8+PGRzOk9iamVjdD48eGFkZXM6UXVhbGlmeWluZ1Byb3BlcnRpZXMgeG1sbnM6eGFkZXM9Imh0dHA6Ly91cmkuZXRzaS5vcmcvMDE5MDMvdjEuMy4yIyIgVGFyZ2V0PSIjU2lnbmF0dXJlMSI+PHhhZGVzOlNpZ25lZFByb3BlcnRpZXMgSWQ9IlNpZ25lZFByb3BlcnRpZXNfMSI+PHhhZGVzOlNpZ25lZFNpZ25hdHVyZVByb3BlcnRpZXM+PHhhZGVzOlNpZ25pbmdUaW1lPjIwMTktMDItMDRUMTk6MTk6MDdaPC94YWRlczpTaWduaW5nVGltZT48L3hhZGVzOlNpZ25lZFNpZ25hdHVyZVByb3BlcnRpZXM+PC94YWRlczpTaWduZWRQcm9wZXJ0aWVzPjwveGFkZXM6UXVhbGlmeWluZ1Byb3BlcnRpZXM+PC9kczpPYmplY3Q+PC9kczpTaWduYXR1cmU+PC9uczM6UmljZXZ1dGFTY2FydG8+',
      result: null,
      errorCode: null,
      errorDescription: null,
    },
  ],
  errorCode: '0000',
  errorDescription: null,
}
const MOCK_IN_CHARGE = {
  count: 0,
  notifications: null,
  errorCode: '0002',
  errorDescription: 'Fattura con nome file IT01879020517_sKxup.xml.p7m non presente',
}
const MOCK_SENT = {
  count: 0,
  notifications: [],
  errorCode: '0000',
  errorDescription: null,
}
const MOCK_RECEIVED = {
  count: 1,
  notifications: [
    {
      filename: 'IT01879020517_sKxm5_RC_002.xml',
      number: null,
      notificationDate: null,
      docType: 'MC',
      date: '2021-02-23T09:06:40.000+0000',
      invoiceId: '6034c5886d86341f561313c4',
      file: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48bnMzOlJpY2V2dXRhQ29uc2VnbmEgeG1sbnM6bnMzPSJodHRwOi8vaXZhc2Vydml6aS5hZ2VuemlhZW50cmF0ZS5nb3YuaXQvZG9jcy94c2QvZmF0dHVyYS9tZXNzYWdnaS92MS4wIiB4bWxuczpuczI9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvMDkveG1sZHNpZyMiIHZlcnNpb25lPSIxLjAiPgogICAgPElkZW50aWZpY2F0aXZvU2RJPjQ1OTExNzAzNjI8L0lkZW50aWZpY2F0aXZvU2RJPgogICAgPE5vbWVGaWxlPklUMDE4NzkwMjA1MTdfc0t4bTUueG1sLnA3bTwvTm9tZUZpbGU+CiAgICA8SGFzaD5iNGYzNTk0MDdkNzEyNjk5YWVjOWMzNDJiZWIwNTMyODRmODU1MzFlNjhlMjJlOWJkNTA0NmJmNmFkNjhkZDAxPC9IYXNoPgogICAgPERhdGFPcmFSaWNlemlvbmU+MjAyMS0wMi0yM1QxMDowNjoxMS4wMDArMDE6MDA8L0RhdGFPcmFSaWNlemlvbmU+CiAgICA8RGF0YU9yYUNvbnNlZ25hPjIwMjEtMDItMjNUMTA6MDY6MjQuMDAwKzAxOjAwPC9EYXRhT3JhQ29uc2VnbmE+CiAgICA8RGVzdGluYXRhcmlvPgogICAgICAgIDxDb2RpY2U+MDAwMDAwMDwvQ29kaWNlPgogICAgICAgIDxEZXNjcml6aW9uZT5UcmFzbWVzc28gc3UgY2FuYWxlIHJlZ2lzdHJhdG8gZGFsIGNlc3Npb25hcmlvL2NvbW1pdHRlbnRlPC9EZXNjcml6aW9uZT4KICAgIDwvRGVzdGluYXRhcmlvPgogICAgPE1lc3NhZ2VJZD4xMTcxNjA4MTE5MTwvTWVzc2FnZUlkPgo8ZHM6U2lnbmF0dXJlIHhtbG5zOmRzPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwLzA5L3htbGRzaWcjIiBJZD0iU2lnbmF0dXJlMSI+PGRzOlNpZ25lZEluZm8+PGRzOkNhbm9uaWNhbGl6YXRpb25NZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzEwL3htbC1leGMtYzE0biMiLz48ZHM6U2lnbmF0dXJlTWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxkc2lnLW1vcmUjcnNhLXNoYTI1NiIvPjxkczpSZWZlcmVuY2UgSWQ9InJlZmVyZW5jZS1kb2N1bWVudCIgVVJJPSIiPjxkczpUcmFuc2Zvcm1zPjxkczpUcmFuc2Zvcm0gQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAyLzA2L3htbGRzaWctZmlsdGVyMiI+PFhQYXRoIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAyLzA2L3htbGRzaWctZmlsdGVyMiIgRmlsdGVyPSJzdWJ0cmFjdCI+L2Rlc2NlbmRhbnQ6OmRzOlNpZ25hdHVyZTwvWFBhdGg+PC9kczpUcmFuc2Zvcm0+PC9kczpUcmFuc2Zvcm1zPjxkczpEaWdlc3RNZXRob2QgQWxnb3JpdGhtPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGVuYyNzaGEyNTYiLz48ZHM6RGlnZXN0VmFsdWU+aHNVRGR1Q1I3VXRFTFErRWN0MUVlb0c3bElVdmlieXIwUlEza2Fsd3ZZTT08L2RzOkRpZ2VzdFZhbHVlPjwvZHM6UmVmZXJlbmNlPjxkczpSZWZlcmVuY2UgSWQ9InJlZmVyZW5jZS1zaWduZWRwcm9wZXRpZXMiIFR5cGU9Imh0dHA6Ly91cmkuZXRzaS5vcmcvMDE5MDMjU2lnbmVkUHJvcGVydGllcyIgVVJJPSIjU2lnbmVkUHJvcGVydGllc18xIj48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzOkRpZ2VzdFZhbHVlPms4ZmVBLzhvUXF1RkFTbnpBSDIyUXYzR1UzYUdPSUJqd3NHUS9SUjJRbzQ9PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48ZHM6UmVmZXJlbmNlIElkPSJyZWZlcmVuY2Uta2V5aW5mbyIgVVJJPSIjS2V5SW5mb0lkIj48ZHM6RGlnZXN0TWV0aG9kIEFsZ29yaXRobT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS8wNC94bWxlbmMjc2hhMjU2Ii8+PGRzOkRpZ2VzdFZhbHVlPm44a05sTzdnT2NYVVVpSmdONkRyTkZFZjB5SnFsSDJ3UmpkUU4yMUFYZWM9PC9kczpEaWdlc3RWYWx1ZT48L2RzOlJlZmVyZW5jZT48L2RzOlNpZ25lZEluZm8+PGRzOlNpZ25hdHVyZVZhbHVlIElkPSJTaWduYXR1cmVWYWx1ZTEiPlR6cTRwWlVqYzlTUWw5cFFXZk15QU1YcFplcGNYS0V4aFFNVFJlUjNmTUZhM01JeWVUTjgyVFEyckhzL1BEUEk3NENhVExaM1VqM3YKMEFJWm9VTFRrSEYzUlBKejNHaXpQMTd0Si95WXpNVmh4Q1kwdFB6TlhQK3BQTnlOMDNVaTFyVk9XMlpZeEFydFRkV0MxUG1Xejc2TQpHT04zSlk4cmhsdGpNc0xYdGZ6RGtCVWx1ZGRxOFgwMUlvNkZhWkU1aWZDTm1XWi9tU0ZXRlptblJOSmdaYWZiU1F0STE3RnlXeWdHCmx2ZUhSM2lzekh4QzFCNVFGdmFRSTY2RFhXTktUQ2x6THVwclJzSVB6SC9PbGJGTjB0VkwyN1pzUlNkS1k1Tk5zVWlqK3VjQTduOGkKanZ4Y2NGeUtOWUZuY2FYMHpqdGhKbVFnVjBwUTFLZHdDbHFYZ2c9PTwvZHM6U2lnbmF0dXJlVmFsdWU+PGRzOktleUluZm8gSWQ9IktleUluZm9JZCI+PGRzOlg1MDlEYXRhPjxkczpYNTA5Q2VydGlmaWNhdGU+TUlJRVpUQ0NBMDJnQXdJQkFnSUlON3dBRTBCU2RQTXdEUVlKS29aSWh2Y05BUUVMQlFBd2JURUxNQWtHQTFVRUJoTUNTVlF4SGpBYwpCZ05WQkFvVEZVRm5aVzU2YVdFZ1pHVnNiR1VnUlc1MGNtRjBaVEViTUJrR0ExVUVDeE1TVTJWeWRtbDZhU0JVWld4bGJXRjBhV05wCk1TRXdId1lEVlFRREV4aERRU0JCWjJWdWVtbGhJR1JsYkd4bElFVnVkSEpoZEdVd0hoY05NakF3TlRJMU1UZ3pOakEyV2hjTk1qRXcKTlRNeE1URXlOakV4V2pCME1Rc3dDUVlEVlFRR0V3SkpWREVlTUJ3R0ExVUVDZ3dWUVdkbGJucHBZU0JrWld4c1pTQkZiblJ5WVhSbApNUnN3R1FZRFZRUUxEQkpUWlhKMmFYcHBJRlJsYkdWdFlYUnBZMmt4S0RBbUJnTlZCQU1NSDFOcGMzUmxiV0VnU1c1MFpYSnpZMkZ0ClltbHZJRVpoZEhSMWNtRWdVRUV3Z2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRQ3hQRVRGUWw2NUpZb0QKZWhVWUNHS2xDaGowaFo3YUpKUWdvMXR3V3lVTEN0SERqUi9tMzMvS2lxejJjM3J1dndmZHdIcEV6NGlBZkZyc2ZPcmtGa29jYmZpMApja3RyRjZBcUtkUG5rSWtnYnFpaFk3TC9ISEU3VU1xdHllRFFsaG9DclJ0MGU0dkY4L1lYdDJjWFNGQkhJaThPdUgxckI4bkZvdTAyCmt4Ujgwck16M3lJWjlRWDJDV3F3K0lLTUk1VHFtSUdIdDhrUER0Q3BTUTI2TG45a3hVZXBiMTBxRHFVWnIwNUtlYU9jNUk0MllINS8KZ2ZHc3NyUFlkMVAva3p3MDEzVWNDWU13bmhQK0pFekxXbXFYZmQ4QncwNXBSR2dmNU1ibTZleEd1ZDEyb0FyMFZqWnNVcE1OS0RxagpEOVA0YUJRMVlJenFYM3NIZDlTM2ttY3ZBZ01CQUFHamdnRUFNSUg5TUI4R0ExVWRJd1FZTUJhQUZPcEVQeDhaNHpjK3E2cVVncVdmCjYvd1d1bisxTUlHcUJnTlZIUjhFZ2FJd2daOHdnWnlnZ1ptZ2daYUdnWk5zWkdGd09pOHZZMkZrY3k1bGJuUnlZWFJsTG1acGJtRnUKZW1VdWFYUXZRMDQ5UTBFbE1qQkJaMlZ1ZW1saEpUSXdaR1ZzYkdVbE1qQkZiblJ5WVhSbExFOVZQVk5sY25acGVta2xNakJVWld4bApiV0YwYVdOcExFODlRV2RsYm5wcFlTVXlNR1JsYkd4bEpUSXdSVzUwY21GMFpTeERQV2wwUDJObGNuUnBabWxqWVhSbFVtVjJiMk5oCmRHbHZia3hwYzNRd0hRWURWUjBPQkJZRUZCNGliaXcwTGZKeXJHYVRtN0tWc1VlZXV2OGNNQTRHQTFVZER3RUIvd1FFQXdJR1FEQU4KQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBSTcyZS9vcXdqTXZGRlV0WVI3V3F0L05QdjkxLzhIZkN1emdlTlB0L3JuUkJKR09FOTZjeAo3eFJmcWRlWmpmTnovRmJHTGVtT25RMjV1cFJsQWdsbCs4Tmw2blBHVmhyeUh0akxDY1J3djFqNXNnb0ZiTGdyUDM2dFR4VDBQOGZSCm55STRVZ0hNUlBYL0lqTzBIN1MxZHgvZW93NmdWRThqY0hhSC9qaG5SalhaWCt2dU1mREJtRHo1N3owYTI1WUdOUjY4S2VrSzRWRVcKUElDa0NteDNtVHlkc1NvTkxBUHBZd0lQcWpLeVNaV0NPR1RhcTdXVUZibnFKaldZc2ZBRE9UWGZFcGc0YzNyQ2ovK3ZRd2cxMTh6bApKRVplZ3lFaVRDdFFvNjJBTW5ySFFBQ0hJdEt4d3dXTzZjOUNyb0ZZR1JFU2tZd2N0VnQxd1pkK01tSlo2dz09PC9kczpYNTA5Q2VydGlmaWNhdGU+PC9kczpYNTA5RGF0YT48L2RzOktleUluZm8+PGRzOk9iamVjdD48eGFkZXM6UXVhbGlmeWluZ1Byb3BlcnRpZXMgeG1sbnM6eGFkZXM9Imh0dHA6Ly91cmkuZXRzaS5vcmcvMDE5MDMvdjEuMy4yIyIgVGFyZ2V0PSIjU2lnbmF0dXJlMSI+PHhhZGVzOlNpZ25lZFByb3BlcnRpZXMgSWQ9IlNpZ25lZFByb3BlcnRpZXNfMSI+PHhhZGVzOlNpZ25lZFNpZ25hdHVyZVByb3BlcnRpZXM+PHhhZGVzOlNpZ25pbmdUaW1lPjIwMjEtMDItMjNUMDk6MDY6NDBaPC94YWRlczpTaWduaW5nVGltZT48L3hhZGVzOlNpZ25lZFNpZ25hdHVyZVByb3BlcnRpZXM+PC94YWRlczpTaWduZWRQcm9wZXJ0aWVzPjwveGFkZXM6UXVhbGlmeWluZ1Byb3BlcnRpZXM+PC9kczpPYmplY3Q+PC9kczpTaWduYXR1cmU+PC9uczM6UmljZXZ1dGFDb25zZWduYT4=',
      result: null,
      errorCode: null,
      errorDescription: null,
    },
  ],
  errorCode: '0000',
  errorDescription: null,
}

const knex = require('knex')({ client: 'mysql' })
const { utils } = require(__helpers)
const qs = require('qs')
const { authenticationBaseUrl, baseUrl, username, password } = config.get('e_invoice')

const { axios } = require(__helpers)

async function getAuth () {
  const { data } = await axios.eInvoiceInstance(authenticationBaseUrl).post('/auth/signin', qs.stringify({
    grant_type: 'password',
    username,
    password,
  }))
  return data
}

async function refresh (refreshToken) {
  const { data } = await axios.eInvoiceInstance(authenticationBaseUrl).post('/auth/signin', qs.stringify({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }))
  return data
}

async function manageRequest (params, method = 'post') {
  const { state } = eInvoiceAuth
  log.debug('eInvoiceAuth state:', state)
  switch (state) {
    case authStates.NO_AUTH:
    case authStates.EXPIRED:
      await eInvoiceAuth.setAuth()
      break
    case authStates.REFRESHABLE:
      await eInvoiceAuth.refresh()
      break
    default:// VALID
      break
  }
  const partial = {}
  let cont = 0
  do {
    if (cont) {await eInvoiceAuth.setAuth()}
    const base = axios.eInvoiceInstance(baseUrl, eInvoiceAuth.accessToken)
    const { data, status } = await base[method](...params)
    partial.data = data
    partial.status = status
    cont++
  } while (partial.status === 401)
  return partial
}

async function sendXml (dataFile) {
  const partial = await manageRequest(['/services/invoice/upload', { dataFile }])
  return partial.data
}

async function notification (invoiceFile) {
  const {
    data,
  } = await manageRequest([`/services/notification/out/getByInvoiceFilename?invoiceFilename=${invoiceFile}`], 'get')
  const { ok, results, message } = data
  if (!ok) {return { ok, message }}
  return { ok: true, results: getInvoiceStatus(MOCK_RECEIVED) }
}

async function createXml (req) {
  const { connClass, body, params } = req
  const params_ = { ...body, ...params }
  utils.controlParameters(params_, ['paymentId'])
  const { paymentId } = params_
  return createEInvoiceXML(connClass, paymentId)
}

function addRouters (router) {
  router.post('/e-invoices/send_xml/:paymentId', async function (req, res) {
    utils.checkSecurity(req)
    const { connClass, params } = req
    const { ok: okCreate, results: { buffer: eInvoiceContent, payment }, message: messageCreate } = await createXml(req)
    if (!okCreate) {return res.send(ok, messageCreate)}
    const dataFile = eInvoiceContent.toString('base64')
    const { ok, results: data, message: messageSendXml } = await sendXml(dataFile)
    if (!ok) {return res.send({ ok, message: messageSendXml })}
    const { astenposBucketCollection: collection } = connClass
    const { paymentId } = params
    const { errorCode, errorDescription } = data
    const message = errorDescription.split(' - ')[0]
    const hasError = errorCode !== '0000'
    const statusCode = hasError ? 999 : 3
    const paymentErrorCode = get(payment, 'fatt_elett.res_invoice_upload.errorCode')
    const invoiceData = {
      res_invoice_upload: data,
      status: {
        status_code: statusCode,
      },
    }
    const newDoc = {
      ...payment,
      payment_mode: undefined,
      fatt_elett: invoiceData,
    }
    if (paymentErrorCode !== errorCode) {await collection.upsert(paymentId, newDoc)}
    if (hasError) { return res.send({ ok: false, message, results: statusCode })}
    res.send({ ok: true, results: statusCode, message })
  })
  router.get('/e-invoices/signin', async function (req, res) {
    utils.checkSecurity(req)
    res.send(await refresh(getAuth()))
  })
  router.get('/e-invoices/refresh', async function (req, res) {
    utils.checkSecurity(req)
    const { query } = req
    utils.controlParameters(query, ['refreshToken'])
    const { refreshToken } = query
    res.send(await refresh(refreshToken))
  })
  router.post('/e-invoices/create_xml/:paymentId', async function (req, res) {
    utils.checkSecurity(req)
    const { ok, results: { id: eInvoiceId, buffer: eInvoiceContent }, message } = await createXml(req)
    if (!ok) {return res.send({ ok, message })}
    res.send({ ok, results: { filename: `${eInvoiceId}.xml`, base64: eInvoiceContent.toString('base64') } })
  })
  router.get('/e-invoices/notification/:invoiceFile', async function (req, res) {
    utils.checkSecurity(req)
    const { params } = req
    utils.controlParameters(params, ['invoiceFile'])
    const { invoiceFile } = params
    const { ok, message, results } = await notification(invoiceFile)
    if (!ok) {return res.send({ ok, message })}
    res.send({ ok: true, results })
  })
  router.put('/e-invoices/update_state/:paymentId', async function (req, res) {
    utils.checkSecurity(req)
    const { params, connClass } = req
    utils.controlParameters(params, ['paymentId'])
    const { paymentId } = params
    const collection = connClass.astenposBucketCollection
    const { content } = await collection.get(paymentId)
    const statusCode = get(content, 'fatt_elett.status.status_code')
    const uploadFileName = get(content, 'fatt_elett.res_invoice_upload.uploadFileName')
    if (!statusCode || !uploadFileName) {
      return res.send({ ok: false, message: 'statusCode or uploadFileName not found' })
    }
    const { ok, message, results: responseStatusCode } = await notification(uploadFileName)
    if (!ok) {return res.send({ ok, message })}
    const isDifferent = statusCode !== responseStatusCode
    if (isDifferent) {
      await collection.upsert(paymentId, {
        ...content,
        fatt_elett: {
          ...content.fatt_elett,
          status: {
            status_code: responseStatusCode,
          },
        },
      })
    }
    res.send({
      ok: true,
      results: isDifferent ? { code: 'UPDATED', newStatus: responseStatusCode } : { code: 'SAME_CONTENT' },
    })
  })
  router.put('/e-invoices/update_customer', async function (req, res) {
    const { ok, results: data, message, err } = await updateById(req, true)
    const { connClass, body } = req
    if (!ok) {return res.send({ ok, message, err })}
    const [dataFirst] = data
    if (!dataFirst) {return res.send({ ok, results: null })}
    const { astenposBucketName: bucketName } = connClass
    const statement = knex(bucketName)
      .select(knex.raw('RAW meta().id'))
      .where({ type: 'PAYMENT' })
      .where({ mode: 'INVOICE' })
      .where({ archived: true })
      .where({ 'customer._id': dataFirst.id })
      .where(knex.raw('(fatt_elett.status.status_code IN [777, 999] OR fatt_elett.status.status_code is missing)'))
      .toQuery()
    {
      const { ok, results: payments, message, err } = await couchQueries.exec(statement, connClass.cluster)
      if (!ok) {return res.send({ ok, message, err })}
      if (payments.length) {
        const statement_ = `UPDATE \`${bucketName}\` buc USE KEYS ${JSON.stringify(payments)} ${createSetStatement(body.set, 'customer.')}`
        await couchQueries.exec(statement_, connClass.cluster)
      }
      res.send({ ok, results: payments })
    }
  })
  router.post('/e-invoices/create_zip', async function (req, res) {
    const { connClass, body } = req
    utils.controlParameters(body, ['startDateInMillis', 'endDateInMillis', 'owner'])
    const parsedOwner = utils.parseOwner(req, 'buc')
    const {
      bucketName = connClass.astenposBucketName,
      options,
      startDateInMillis: startDate,
      endDateInMillis: endDate,
    } = body
    const endDate_ = moment(endDate, 'YYYYMMDDHHmmssSSS').endOf('day').format('YYYYMMDDHHmmssSSS')// end day
    const statement = knex({ buc: bucketName })
      .select(knex.raw('buc.*, mode.payment_mode'))
      .joinRaw(`LEFT JOIN \`${bucketName}\` mode ON KEYS buc.income_id`)
      .where({ 'buc.type': 'PAYMENT' })
      .where({ 'buc.mode': 'INVOICE' })
      .where({ 'buc.archived': true })
      .whereBetween('buc.date', [startDate, endDate_])
      .where(knex.raw(parsedOwner.queryCondition))
      .toQuery()
    const { ok, results, message, err } = await couchQueries.exec(statement, connClass.cluster, options)
    if (!ok) {return res.status(412).send({ ok, message, err })}
    const zip = archiver('zip', {})
    zip.pipe(res)
    for (let payment of results) {
      const {
        ok,
        results: { id: eInvoiceId, buffer: eInvoiceContent },
      } = await createEInvoiceXML(connClass, payment)
      if (!ok) {continue}
      zip.append(eInvoiceContent, { name: `${eInvoiceId}.xml` })
    }
    await zip.finalize()
  })
}

export default {
  addRouters,
}
