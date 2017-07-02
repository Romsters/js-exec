const factory = require('./vmFactory');
const { VM } = require('vm2');

describe('createDefaultVM', () => {
  it('should create VM with default settings', () => {
    const vm = factory.createDefaultVM();
    expect(vm instanceof VM).toBeTruthy();
  });
});