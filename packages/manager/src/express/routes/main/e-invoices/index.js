import config from 'config'
import eInvoiceAuth, { authStates } from './eInvoiceClass'
import { createEInvoiceXML, getInvoiceStatus } from './utils'
import log from '@adapter/common/src/winston'
import { couchQueries } from '@adapter/io'
import moment from 'moment'
import archiver from 'archiver'
import { createSetStatement, updateById } from '../queries'
import get from 'lodash/get'

const MOCK_SEARCH = {
  id: '5c53132ea0d613015cae59cf',
  sender: {
    description: 'M.E.M. System Office',
    countryCode: 'IT',
    vatCode: '02829270236',
    fiscalCode: null,
  },
  receiver: {
    description: 'ASTEN',
    countryCode: 'IT',
    vatCode: '00000000000',
    fiscalCode: '00000000000',
  },
  file: 'MIAGCSqGSIb3DQEHAqCAMIACAQExDzANBglghkgBZQMEAgEFADCABgkqhkiG9w0BBwGggCSABIID6DxwOkZhdHR1cmFFbGV0dHJvbmljYSB4bWxuczpkcz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC8wOS94bWxkc2lnIyIgeG1sbnM6cD0iaHR0cDovL2l2YXNlcnZpemkuYWdlbnppYWVudHJhdGUuZ292Lml0L2RvY3MveHNkL2ZhdHR1cmUvdjEuMiIgeG1sbnM6eHNpPSJodHRwOi8vd3d3LnczLm9yZy8yMDAxL1hNTFNjaGVtYS1pbnN0YW5jZSIgdmVyc2lvbmU9IkZQUjEyIiB4c2k6c2NoZW1hTG9jYXRpb249Imh0dHA6Ly9pdmFzZXJ2aXppLmFnZW56aWFlbnRyYXRlLmdvdi5pdC9kb2NzL3hzZC9mYXR0dXJlL3YxLjIgaHR0cDovL3d3dy5mYXR0dXJhcGEuZ292Lml0L2V4cG9ydC9mYXR0dXJhemlvbmUvc2RpL2ZhdHR1cmFwYS92MS4yL1NjaGVtYV9kZWxfZmlsZV94bWxfRmF0dHVyYVBBX3ZlcnNpb25lXzEuMi54c2QiPjxGYXR0dXJhRWxldHRyb25pY2FIZWFkZXI+PERhdGlUcmFzbWlzc2lvbmU+PElkVHJhc21pdHRlbnRlPjxJZFBhZXNlPklUPC9JZFBhZXNlPjxJZENvZGljZT4wMTg3OTAyMDUxNzwvSWRDb2RpY2U+PC9JZFRyYXNtaXR0ZW50ZT48UHJvZ3Jlc3Npdm9JbnZpbz43PC9Qcm9ncmVzc2l2b0ludmlvPjxGb3JtYXRvVHJhc21pc3Npb25lPkZQUjEyPC9Gb3JtYXRvVHJhc21pc3Npb25lPjxDb2RpY2VEZXN0aW5hdGFyaW8+MDAwMDAwMDwvQ29kaWNlRGVzdGluYXRhcmlvPjwvRGF0aVRyYXNtaXNzaW9uZT48Q2VkZW50ZVByZXN0YXRvcmU+PERhdGlBbmFncmFmaWNpPjxJZEZpc2NhbGVJVkE+PElkUGFlc2U+SVQ8L0lkUGFlc2U+PElkQ29kaWNlPjAyODI5MjcwMjM2PC9JZENvZGljZT48L0lkRmlzY2FsZUlWQT48QW5hZ3JhZmljYT48RGVub21pbmF6aW9uZT5NLkUuTS4gU3lzdGVtIE9mZmljZTwvRGVub21pbmF6aW9uZT48L0FuYWdyYWZpY2E+PFJlZ2ltZUZpc2NhbGU+UkYwMTwvUmVnaW1lRmlzY2FsZT48L0RhdGlBbmFncmFmaWNpPjxTZWRlPjxJbmRpcml6em8+UGlhenphIFVuaXTDoCBkJ0l0YWxpYSwgNzwvSW5kaXJpenpvPjxDQVA+MzcwNDEEggPoPC9DQVA+PENvbXVuZT5BbGJhcmVkbyBkJ0FkaWdlPC9Db211bmU+PFByb3ZpbmNpYT5WUjwvUHJvdmluY2lhPjxOYXppb25lPklUPC9OYXppb25lPjwvU2VkZT48L0NlZGVudGVQcmVzdGF0b3JlPjxDZXNzaW9uYXJpb0NvbW1pdHRlbnRlPjxEYXRpQW5hZ3JhZmljaT48SWRGaXNjYWxlSVZBPjxJZFBhZXNlPklUPC9JZFBhZXNlPjxJZENvZGljZT4wMDAwMDAwMDAwMDwvSWRDb2RpY2U+PC9JZEZpc2NhbGVJVkE+PENvZGljZUZpc2NhbGU+MDAwMDAwMDAwMDA8L0NvZGljZUZpc2NhbGU+PEFuYWdyYWZpY2E+PERlbm9taW5hemlvbmU+QVNURU48L0Rlbm9taW5hemlvbmU+PC9BbmFncmFmaWNhPjwvRGF0aUFuYWdyYWZpY2k+PFNlZGU+PEluZGlyaXp6bz5QSUFaWkE8L0luZGlyaXp6bz48Q0FQPjM3MDE0PC9DQVA+PENvbXVuZT5BTEJBUkVETzwvQ29tdW5lPjxQcm92aW5jaWE+VlI8L1Byb3ZpbmNpYT48TmF6aW9uZT5JVDwvTmF6aW9uZT48L1NlZGU+PC9DZXNzaW9uYXJpb0NvbW1pdHRlbnRlPjwvRmF0dHVyYUVsZXR0cm9uaWNhSGVhZGVyPjxGYXR0dXJhRWxldHRyb25pY2FCb2R5PjxEYXRpR2VuZXJhbGk+PERhdGlHZW5lcmFsaURvY3VtZW50bz48VGlwb0RvY3VtZW50bz5URDAxPC9UaXBvRG9jdW1lbnRvPjxEaXZpc2E+RVVSPC9EaXZpc2E+PERhdGE+MjAxOS0wMS0zMTwvRGF0YT48TnVtZXJvPjEwPC9OdW1lcm8+PEltcG9ydG9Ub3RhbGVEb2N1bWVudG8+MC4xMDwvSW1wb3J0b1RvdGFsZURvY3VtZW50bz48L0RhdGlHZW5lcmFsaURvY3VtZW50bz48L0RhdGlHZW5lcmFsaT48RGF0aUJlbmlTZXJ2aXppPjxEZXR0YWdsaW9MaW5lZT48TnVtZXJvTGluZWE+MTwvTnVtZXJvTGluZWE+PERlc2NyaXppb25lPkdlbGF0bzwvRGVzY3JpemlvbmU+PFF1YW50aXRhPjEuMDA8L1F1YW50aXRhPjxQcmV6em9Vbml0YXJpbz4wLjA5MDkxPC9QcmV6em9Vbml0YXJpbz48UHJlenpvVG90YWxlPjAuMDkwOTE8L1ByZXp6b1RvdGFsZT48QWxpcXVvdGFJVkE+MTAuMDA8LwSCAatBbGlxdW90YUlWQT48L0RldHRhZ2xpb0xpbmVlPjxEYXRpUmllcGlsb2dvPjxBbGlxdW90YUlWQT4xMC4wMDwvQWxpcXVvdGFJVkE+PEltcG9uaWJpbGVJbXBvcnRvPjAuMDk8L0ltcG9uaWJpbGVJbXBvcnRvPjxJbXBvc3RhPjAuMDE8L0ltcG9zdGE+PC9EYXRpUmllcGlsb2dvPjwvRGF0aUJlbmlTZXJ2aXppPjxEYXRpUGFnYW1lbnRvPjxDb25kaXppb25pUGFnYW1lbnRvPlRQMDI8L0NvbmRpemlvbmlQYWdhbWVudG8+PERldHRhZ2xpb1BhZ2FtZW50bz48TW9kYWxpdGFQYWdhbWVudG8+TVAwMTwvTW9kYWxpdGFQYWdhbWVudG8+PEltcG9ydG9QYWdhbWVudG8+MC4xMDwvSW1wb3J0b1BhZ2FtZW50bz48L0RldHRhZ2xpb1BhZ2FtZW50bz48L0RhdGlQYWdhbWVudG8+PC9GYXR0dXJhRWxldHRyb25pY2FCb2R5PjwvcDpGYXR0dXJhRWxldHRyb25pY2E+AAAAAAAAoIAwggfbMIIFw6ADAgECAgha3UYHIs/TBTANBgkqhkiG9w0BAQsFADCBsjELMAkGA1UEBhMCSVQxDzANBgNVBAcMBkFyZXp6bzEYMBYGA1UECgwPQXJ1YmFQRUMgUy5wLkEuMRowGAYDVQRhDBFWQVRJVC0wMTg3OTAyMDUxNzEpMCcGA1UECwwgUXVhbGlmaWVkIFRydXN0IFNlcnZpY2UgUHJvdmlkZXIxMTAvBgNVBAMMKEFydWJhUEVDIEVVIFF1YWxpZmll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',
  filename: 'IT01879020517_f69en.xml.p7m',
  invoices: [
    {
      invoiceDate: '2019-01-31T00:00:00.000+01:00',
      number: '10',
      status: 'Scartata',
      statusDescription: '',
    },
  ],
  username: 'PIVAIT02829270236',
  lastUpdate: '2019-01-31T16:21:17.000+0000',
  idSdi: '247087292',
  creationDate: '2019-01-31T15:24:30.000+0000',
  errorCode: '0000',
  errorDescription: null,
  pddAvailable: false,
  invoiceType: 'FPR12',
  docType: 'out',
}

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
  let count = 0
  do {
    if (count) {await eInvoiceAuth.setAuth()}
    const base = axios.eInvoiceInstance(baseUrl, eInvoiceAuth.accessToken)
    const { data, status } = await base[method](...params)
    partial.data = data
    partial.status = status
    count++
  } while (partial.status === 401)
  return partial
}

async function sendXml (dataFile) {
  const partial = await manageRequest(['/services/invoice/upload', { dataFile }])
  return partial.data
}

async function notification (invoiceFile, onlyStatus = true) {
  const {
    data,
  } = await manageRequest([`/services/notification/out/getByInvoiceFilename?invoiceFilename=${invoiceFile}`], 'get')
  const { ok, results, message } = data
  if (!ok) {return { ok, message }}
  return onlyStatus ? { ok, results: getInvoiceStatus(results) } : { ok: true, results }
}

async function search (invoiceFile, pdf = false, xml = false) {
  let filter = !xml ? '&includeFile=false' : ''
  if(pdf){filter+='&includePdf=true'}
  const {
    data,
  } = await manageRequest([`/services/invoice/out/getByFilename?filename=${invoiceFile}${filter}`], 'get')
  const { ok, results, message } = data
  if (!ok) {return { ok, message }}
  return { ok, results }
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
  router.post('/e-invoices/create_xml/:paymentId', async function (req, res) {
    utils.checkSecurity(req)
    const { ok, results: { id: eInvoiceId, buffer: eInvoiceContent }, message } = await createXml(req)
    if (!ok) {return res.send({ ok, message })}
    res.send({ ok, results: { filename: `${eInvoiceId}.xml`, base64: eInvoiceContent.toString('base64') } })
  })
  router.post('/e-invoices/xml_notification/:invoiceFile', async function (req, res) {
    utils.checkSecurity(req)
    const { params } = req
    utils.controlParameters(params, ['invoiceFile'])
    const { invoiceFile } = params
    const { ok, message, results } = await notification(invoiceFile, false)
    if (!ok) {return res.send({ ok, message })}
    const last = results.notifications[results.notifications.length - 1] || {}
    res.send({ ok, results: { filename: last.filename, base64: last.file } })
  })
  router.post('/e-invoices/search/:invoiceFile', async function (req, res) {
    utils.checkSecurity(req)
    const { params, query } = req
    utils.controlParameters(params, ['invoiceFile'])
    const { invoiceFile } = params
    const { allData = false, pdf = true, xml = false } = query
    const { ok, message, results } = await search(invoiceFile, pdf, xml)
    if (!ok) {return res.send({ ok, message })}
    res.send(allData ? { ok, results } : { ok, results: { filename: results.filename, base64: results.pdfFile } })
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
