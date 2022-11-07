const { AZURE_ACCOUNT, AZURE_KEY, NODE_ENV } = process.env
const {
    QueueServiceClient,
    StorageSharedKeyCredential,
} = require('@azure/storage-queue')

const sharedKeyCredential = new StorageSharedKeyCredential(
    AZURE_ACCOUNT,
    AZURE_KEY
)
const { EventEmitter } = require('node:events')

const AZURE_URL =
    process.env.AZURE_AZURITE == 'true'
        ? `http://localhost:10001/${AZURE_ACCOUNT}`
        : `https://${AZURE_ACCOUNT}.queue.core.windows.net`

const { startmonitor } = require('../../server')

module.exports = class MonitorQueue extends EventEmitter {
    queue
    queueName = `uptime-${NODE_ENV}-monitorqueue`
    constructor(queueName) {
        super()
        this.queueName = queueName || this.queueName
        console.log(`Initializing monitor queue - ${this.queueName}...`)
        const queueServiceClient = new QueueServiceClient(
            AZURE_URL,
            sharedKeyCredential
        )
        this.queue = queueServiceClient.getQueueClient(this.queueName)
    }

    start() {
        setInterval(async () => {
            const messages = await this.getQueue()
            if (messages) {
                messages.forEach(async (message) => {
                    const { data } = message
                    this.emit('startmonitor', data)
                    await this.queue.deleteMessage(
                        message.messageId,
                        message.popReceipt
                    )
                })
            }
        }, 1000)
    }

    async createQueue() {
        console.log(`Creating monitor queue - ${this.queueName}...`)
        await this.queue.createIfNotExists()
    }

    async getQueue() {
        try {
            await this.queue.createIfNotExists()
            const response = await this.queue.receiveMessages()
            if (response.receivedMessageItems.length == 0) {
                // log("Nothing to process")
                return
                // nothing to process
            } else {
                return response.receivedMessageItems.map((message) => {
                    return { ...message, data: JSON.parse(message.messageText) }
                })
            }
        } catch (e) {
            console.log(e)
        }
    }
    async addMessage(message) {
        try {
            await this.queue.createIfNotExists()
            await this.queue.sendMessage(JSON.stringify(message))
            console.log(`Added message to queue - ${this.queueName}`)
        } catch (e) {
            console.log(e)
        }
    }
}
