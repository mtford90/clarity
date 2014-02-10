'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

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