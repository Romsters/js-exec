const amqp = require('amqplib');
const server = require('./server');
const config = require('./config');
const logger = require('./logging/consoleLogger');
const executor = require('./executor');

const channel = {
  prefetch() {
  },
  consume() {
  },
  assertQueue() {
  },
  sendToQueue() {
  },
  ack() {
  }
};
const connection = {
  createChannel() {
  }
};

const message = {
  content: 'filename',
  properties: {
    replyTo: 'replyTo',
    correlationId: 'id'
  }
};

describe('start', () => {
  beforeEach(() => {
    spyOn(connection, 'createChannel').andReturn(Promise.resolve(channel));
    spyOn(amqp, 'connect').andReturn(connection);
    spyOn(channel, 'assertQueue');
    spyOn(channel, 'consume');
    spyOn(channel, 'prefetch');
    spyOn(logger, 'log');
  });
  it('should initialize connection, channel and queue', done => {
    server.start().then(() => {
      expect(amqp.connect).toHaveBeenCalledWith(`amqp://${config.rabbitMQ.host}:${config.rabbitMQ.port}`);
      expect(connection.createChannel).toHaveBeenCalled();
      expect(channel.assertQueue).toHaveBeenCalledWith(config.requestsQueueName, {
        durable: false });
      expect(channel.prefetch).toHaveBeenCalledWith(config.rabbitMQ.prefetchCount);
      expect(channel.consume).toHaveBeenCalledWith(config.requestsQueueName, jasmine.any(Function));
      done();
    });
  });
  it('should log ready message', done => {
    server.start().then(() => {
      expect(logger.log).toHaveBeenCalledWith('Awaiting requests...');
      done();
    });
  });
});

describe('handle', () => {
  beforeEach(() => {
    server.channel = channel;
    spyOn(channel, 'sendToQueue');
    spyOn(channel, 'ack');
    spyOn(logger, 'error');
    spyOn(logger, 'log');
  });
  describe('when executor throws an error', () => {
    beforeEach(() => {
      spyOn(executor, 'executeFile').andReturn(Promise.reject('something went wrong'));
    });
    it('should log info message', done => {
      server.handle(message).then(() => {
        expect(logger.log).toHaveBeenCalledWith('filename received');
        done();
      });
    });
    it('should try to execute file', done => {
      server.handle(message).then(() => {
        expect(executor.executeFile).toHaveBeenCalledWith('filename');
        done();
      });
    });
    it('should log error', done => {
      server.handle(message).then(() => {
        expect(logger.error).toHaveBeenCalledWith('something went wrong');
        done();
      });
    });
    it('should send result to queue', done => {
      server.handle(message).then(() => {
        expect(server.channel.sendToQueue).toHaveBeenCalledWith('replyTo', jasmine.any(Buffer), { correlationId: 'id' });
        expect(server.channel.ack).toHaveBeenCalledWith(message);
        done();
      });
    });
  });
  describe('when executor returns results', () => {
    beforeEach(() => {
      spyOn(executor, 'executeFile').andReturn(Promise.resolve('result'));
    });
    it('should log info message', done => {
      server.handle(message).then(() => {
        expect(logger.log).toHaveBeenCalledWith('filename received');
        done();
      });
    });
    it('should try to execute file', done => {
      server.handle(message).then(() => {
        expect(executor.executeFile).toHaveBeenCalledWith('filename');
        done();
      });
    });
    it('should not log error', done => {
      server.handle(message).then(() => {
        expect(logger.error).not.toHaveBeenCalledWith('something went wrong');
        done();
      });
    });
    it('should send result to queue', done => {
      server.handle(message).then(() => {
        expect(server.channel.sendToQueue).toHaveBeenCalledWith('replyTo', jasmine.any(Buffer), { correlationId: 'id' });
        expect(server.channel.ack).toHaveBeenCalledWith(message);
        done();
      });
    });
  });
});