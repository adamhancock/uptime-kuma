require('dotenv').config()
;(async function () {
    const MonitorQueue = require('./modules/monitorqueue')
    const monitorqueue = new MonitorQueue()
    await monitorqueue.addMessage({ id: 1 })
    process.exit(0)
})()
