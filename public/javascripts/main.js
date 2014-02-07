/**
 * Created by mtford on 01/02/2014.
 */

$(function(){

    $(".gridster ul").gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [140, 140]
    });

});

angular.module('vision',[])

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

    }])

    .controller('StatsController', ['$scope', '$log', 'stats', function($scope, $log, stats) {
        $scope.cpuUsage = null;
        $scope.swap = null;
        $scope.percUsed = {};

        init();

        function date() {
            return new Date().toTimeString().split("GMT")[0].trim()
        }

        function init () {
            $log.debug('Initalising stats');
            stats.cpu(function (data) {
                $log.debug('CPU data returned', data);
                $scope.cpuUsage = {
                    usage: data["1"],
                    lastUpdated: date()
                }
            });
            stats.swap(function (data) {
                $log.debug('Swap returned', data);
                $scope.swap = {
                    usage: data,
                    lastUpdated: date()
                }
            });
            var ubuntuPath = "/home/ubuntu";
            stats.percUsed(ubuntuPath, function (data) {
                $log.debug('PercUsed returned', data);
                $scope.percUsed.ubuntu = {
                    usage: data,
                    lastUpdated: date(),
                    path: ubuntuPath
                };
            });
            var mntPath = "/mnt";
            stats.percUsed(mntPath, function (data) {
                $log.debug('PercUsed returned', data);
                $scope.percUsed.mnt = {
                    usage: data,
                    lastUpdated: date(),
                    path: mntPath
                };
            });
        }

    }]);

