/**
 * Created by mtford on 01/02/2014.
 */

var Sequelize = require('sequelize');
var Crypto = require('crypto');
var Logger = require('../config').logger;
var UUID = require('node-uuid');

exports.sequelize = new Sequelize('vision', 'username', 'password', {
    dialect: 'sqlite',
    storage: ':memory:'
});

function getHashedPassword(user, password) {
    var h = Crypto.createHash('sha512');
    h.update(user.getDataValue('passwordSalt'));
    h.update(password);
    var hashed = h.digest('base64');
    Logger.debug(hashed);
    return  hashed;
}

exports.User = exports.sequelize.define('User', {
    username: Sequelize.STRING,
    passwordSalt: Sequelize.STRING,
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        get: function () {
            return this.getDataValue('password');
        },
        set: function (password) {
            this.generatePasswordSalt();
            var hashed = getHashedPassword(this, password);
            this.setDataValue('password', hashed);
        }
    }
}, {
    instanceMethods: {
        generatePasswordSalt: function () {
            this.passwordSalt = UUID.v1();
        },
        verifyPassword: function (pass) {
            return this.password === getHashedPassword(this, pass);
        }
    }
});

