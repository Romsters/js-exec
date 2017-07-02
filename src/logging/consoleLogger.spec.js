const logger = require('./consoleLogger.js');

describe('log', () => {
  beforeEach(() => {
    spyOn(console, 'log');
  });
  it('should log message to console stdout', () => {
    const message = 'message';
    logger.log(message);
    expect(console.log).toHaveBeenCalledWith(message);
  });
});

describe('error', () => {
  beforeEach(() => {
    spyOn(console, 'error');
  });
  it('should log message to console stderr', () => {
    const message = 'message';
    logger.error(message);
    expect(console.error).toHaveBeenCalledWith(message);
  });
});