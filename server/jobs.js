const path = require('path')
const Cabin = require('cabin')
const Bree = require('bree')
const { SHARE_ENV } = require('worker_threads')

const jobs = [
    {
        name: 'clear-old-data',
        interval: 'at 03:14',
    },
    // {
    //     name: 'poll-azure-queue',
    //     interval: 'every 1 seconds',
    // },
]

const initBackgroundJobs = function (args) {
    const bree = new Bree({
        root: path.resolve('server', 'jobs'),
        jobs,
        logger: new Cabin(),
        worker: {
            env: SHARE_ENV,
            workerData: args,
        },
        workerMessageHandler: (message) => {
            console.log('[Background Job]:', message)
        },
    })

    bree.start()
    return bree
}

module.exports = {
    initBackgroundJobs,
}
