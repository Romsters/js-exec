const vmFactory = require('./vmFactory');
const repository = require('../storage/repository');

module.exports = {
  async runCodeFromFile(filename) {
    if (!filename) {
      throw new Error('filename is required');
    }
    const code = await repository.getByName(filename);
    const vm = vmFactory.createDefaultVM();
    try {
      return vm.run(code);
    } catch (e) {
      return `Error, ${e}`;
    }
  }
};