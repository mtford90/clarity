'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1')
    .factory('stats', ['$log', '$http', '$interval', function($log, $http, $interval) {

        var STATS_URL = '/stats/{stat}';
        var INTERVAL = 1500;

        return {
            cpu: _.partial(getStat, 'cpu', {}),
            swap: _.partial(getStat, 'swap', {}),
            percUsed: function (path, callback) {getStat('percUsed', {path:path}, callback)},
            percFree: function (path, callback) {getStat('percFree', {path:path}, callback)}
        };

        function getStat(stat, params, callback) {
            var invocation = _.partial(__getStat, stat, params, callback);
            invocation();
            return $interval(invocation, INTERVAL);
        }

        function __getStat(stat, params, callback) {
            var url = STATS_URL.replace('{stat}', stat);
            $http({url:url, params:params, method:'GET'})
                .success(function (responseData) {
                    if (callback) callback(responseData.data);
                })
                .error(function (data, status) {
                    $log.error('Error:', status, data);
                    alert('Error: ' + status.toString())
                });
        }

    }]);
