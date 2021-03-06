const colors = require("colors/safe");
const bundle = global.__bundle;

exports.command = 'hdbsql';

exports.describe = bundle.getText("hdbsql");


exports.builder = {
  admin: {
    alias: ['a', 'Admin'],
    type: 'boolean',
    default: false,
    desc: bundle.getText("admin")
  }
};

exports.handler = function (argv) {
  const prompt = require('prompt');
  prompt.override = argv;
  prompt.message = colors.green(bundle.getText("input"));
  prompt.start();

  var schema = {
    properties: {
      admin: {
        description: bundle.getText("admin"),
        type: 'boolean',
        required: true,
        ask: () => {
          return false;
        }
      }
    }
  };

  prompt.get(schema, (err, result) => {
    if (err) {
      return console.log(err.message);
    }
    global.startSpinner()
    launchHdbsql(result);
  });
}


async function launchHdbsql(result) {
  const dbClass = require("../utils/dbPromises");
  let envFile = dbClass.resolveEnv(result);
  const xsenv = require("@sap/xsenv");
  xsenv.loadEnv(envFile);
  let options = await xsenv.getServices({ hana: { tag: 'hana' }, });
  let encrypt = ''
  if (options.hana.encrypt == true) {
    encrypt = '-attemptencrypt'
  }
  let cmd = `hdbsql -u ${options.hana.user} -n ${options.hana.host + ":" + options.hana.port} -p ${options.hana.password} ${encrypt} -A -m -j`

  const { spawn } = require('child_process');
  await spawn(cmd, [], { shell: true, stdio: 'inherit' });
  global.__spinner.stop()
  return;
}