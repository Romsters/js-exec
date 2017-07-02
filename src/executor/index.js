const path = require('path');
const fork = require('child_process').fork;
const querablePromise = require('../utils/querablePromise');
const config = require('../config');

module.exports = {
  executeFile(filename) {
    let qPromise;
    const promise = new Promise((resolve, reject) => {
      const childProcess = fork(path.resolve(__dirname, './exec.js'), [filename]);
      const timeout = setTimeout(() => {
        this._onTimeout(reject, qPromise, childProcess);
      }, config.childProcessTimeout);
      childProcess.on('message', response => {
        this._onMessage(resolve, reject, response, timeout);
      });
      childProcess.on('exit', code => {
        this._onExit(reject, qPromise, timeout, code);
      });
    });
    qPromise = querablePromise(promise);
    return qPromise;
  },
  _onMessage(resolve, reject, response, timeout) {
    clearTimeout(timeout);
    if (response.success) {
      resolve(response.result);
      return;
    }
    reject(response.result);
  },
  _onExit(reject, promise, timeout, code) {
    clearTimeout(timeout);
    if (promise.isFulfilled()) {
      return;
    }
    reject(`Error, process exited with code: ${code}`);
  },
  _onTimeout(reject, promise, childProcess) {
    if (promise.isFulfilled()) {
      return;
    }
    reject('Error, timeout exceeded');
    childProcess.kill();
  }
};