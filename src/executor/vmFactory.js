const { VM } = require('vm2');
const config = require('../config');

module.exports = {
  createDefaultVM() {
    return new VM(config.vm);
  }
};