/**
 * Created by mtford on 10/02/2014.
 */

exports.server = {
    name: 'MosaycDev',
    host: '46.51.201.85',
    port: 22,
    username: 'ubuntu',
    privateKey: require('fs').readFileSync('/Users/mtford/Dropbox/Drake/Server-Side/dev.pem').toString()
};