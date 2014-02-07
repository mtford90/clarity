/**
 * Created by mtford on 01/02/2014.
 */

var Data = require('../../../lib/sql-data');
var Utils = require('../../../lib/utils');
var Logger = require('../../../config').logger;

module.exports = {

    'Test User Security': function (test) {
        Data.sequelize.sync().success(function () {
           Data.User.create({
               username: 'mike',
               password: 'mikespassword'
           }).success(function(user) {
               test.ok(user, 'Failed to create user');
               test.ok(user.verifyPassword('mikespassword'), 'Failed to validate correct password.');
               test.ok(!user.verifyPassword('wrongpassword'), 'Failed to validate incorrect password.');
               test.done();
            })
        });
    }

};