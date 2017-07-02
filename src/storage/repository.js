const fileReader = require('../utils/fileReader');
const _ = require('lodash');
const config = require('../config');
const cacheProvider = require('./cache/redisProvider');

module.exports = {
  async getByName(filename) {
    if (_.isNil(filename)) {
      throw new Error('filename is required');
    }
    const fileContent = await cacheProvider.get(filename);
    if (!_.isNil(fileContent)) {
      return fileContent;
    }
    const data = await fileReader.read(`${config.storage.path}/${filename}`);
    cacheProvider.set(filename, data);
    return data.toString();
  }
};