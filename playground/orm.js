/**
 * Created by mtford on 01/02/2014.
 */

var sqlite3 = require('sqlite3').verbose();
var Sequelize = require('sequelize');

var db = new sqlite3.Database(':memory:');
var sequelize = new Sequelize('vision', 'username', 'password', {
   dialect: 'sqlite',
   storage: ':memory:'
});

var User = sequelize.define('User', {
    username: Sequelize.STRING,
    birthday: Sequelize.DATE
});

sequelize.sync().success(function() {
    User.create({
        username: 'sdepold',
        birthday: new Date(1986, 6, 28)
    }).success(function(sdepold) {
            console.log(sdepold.values)
        })
});

sequelize.sync().success(function() {
    User.create({
        username: 'bob',
        birthday: new Date(2003, 6, 28)
    }).success(function(bob) {
        console.log(bob.values)
    })
})