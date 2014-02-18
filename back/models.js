/**
 * Created by mtford on 17/02/2014.
 */

module.exports = {
    Server: {
        id: 'Server',
        required: [],
        properties: {
            _id: {
                type: 'integer',
                format: 'int64'
            },
            host: {
                type: 'string'
            },
            port: {
                type: 'integer'
            },
            username: {
                type: 'string'
            },
            password: {
                type: 'string'
            },
            privateKeyPath: {
                type: 'string'
            }
        }
    }
};