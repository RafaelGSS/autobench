const debug = require('debug')

const logDebug = debug('autobench:debug')
const logInfo = debug('autobench:info')
const logError = debug('autobench:error')

module.exports = {
  logDebug,
  logInfo,
  logError
}
