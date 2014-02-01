/**
 * Created by mtford on 01/02/2014.
 */

$(function(){ //DOM Ready

    $(".gridster ul").gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [140, 140]
    });

});

angular.module('vision',[])

    .factory('stats', ['$log', '$http', function($log, $http) {

        return {
            cpu: cpu
        };

        function cpu(callback) {
            $http.get('/stats/cpu')
                .success(function(data) {
                    if (callback) callback(data);
                })
                .error(function(data, status) {
                    $log.error('HTTP Error:', status, data);
                    alert('Error: ' + status.toString())
                })
        }

    }])

    .controller('StatsController', ['$scope', '$log', 'stats', function($scope, $log, stats) {
        $scope.cpuUsage = null;

        init();

        function init () {
            $log.debug('Initalising stats');
            stats.cpu(function (data) {
                $log.debug('CPU data returned', data);
                $scope.cpuUsage = {
                    usage: data["1"],
                    lastUpdated: new Date().toTimeString().split("GMT")[0].trim()
                }
            });
        }

    }]);

