const amqp = require('amqplib');
const config = require('./config');
const logger = require('./logging/consoleLogger');
const executor = require('./executor');

const QUEUE_NAME = config.requestsQueueName;
const PREFETCH_COUNT = config.rabbitMQ.prefetchCount;

module.exports = {
  async start() {
    this.connection = await amqp.connect(`amqp://${config.rabbitMQ.host}:${config.rabbitMQ.port}`);
    this.channel = await this.connection.createChannel();
    this.channel.assertQueue(QUEUE_NAME, { durable: false });
    this.channel.prefetch(PREFETCH_COUNT);
    this.channel.consume(QUEUE_NAME, this.handle.bind(this));
    logger.log('Awaiting requests...');
  },
  async handle(msg) {
    const filename = msg.content.toString();
    logger.log(`${filename} received`);
    let result = null;
    try {
      result = await executor.executeFile(filename);
    } catch (e) {
      logger.error(e);
    } finally {
      this.channel.sendToQueue(msg.properties.replyTo,
      new Buffer(result ? result.toString() : 'error'),
      { correlationId: msg.properties.correlationId });
      this.channel.ack(msg);
    }
  }
};