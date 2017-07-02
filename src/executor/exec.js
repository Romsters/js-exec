const runner = require('./runner');

const args = process.argv.slice(2);
const filename = args[0];

runner.runCodeFromFile(filename).then(result => {
  process.send({
    success: true,
    result
  });
}).catch(e => {
  process.send({
    success: false,
    result: e
  });
}).then(process.exit);