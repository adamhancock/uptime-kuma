require('dotenv').config()
;(async function () {
    const MonitorQueue = require('./modules/monitorqueue')
    const monitorqueue = new MonitorQueue()
    monitorqueue.addMessage({ id: 1 })
})()
