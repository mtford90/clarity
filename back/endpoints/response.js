/**
 * Created by mtford on 16/02/2014.
 */

statusCodes = {
    0: 'Unknown',
    1: 'Success',
    2: 'SSH Failure',
    3: 'No path specified'
};

function badRequest(res, errorCode, extra) {
    res.setHeader('Content-Type', 'application/json');
    res.status(400);
    var errorMessage = 'Unknown';
    if (errorCode in statusCodes) errorMessage = statusCodes[errorCode];
    var response_data = {
        error: {
            code: errorCode,
            message: errorMessage
        }
    };
    if (extra) response_data[error].extra = extra;
    res.end(JSON.stringify(response_data));
}

function serverError(res, err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500);
    res.end(JSON.stringify({error:err}));
}

function success(res, data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        data: data
    }));
}

exports.statusCodes = statusCodes;
exports.badRequest = badRequest;
exports.success = success;
exports.serverError = serverError;