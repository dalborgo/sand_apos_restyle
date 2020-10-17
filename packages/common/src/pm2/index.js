import pm2 from 'pm2'

function pm2Restart (process) {
  return new Promise(resolve => {
    pm2.connect(function (err) {
      if (err) {return resolve({ ok: false, message: err.message })}
      pm2.restart(process, function (err) {
        pm2.disconnect()
        if (err) {return resolve({ ok: false, message: err.message })}
        resolve({ ok: true, results: true })
      })
    })
  })
}

export default {
  pm2Restart,
}
