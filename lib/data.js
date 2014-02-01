/**
 * Created by mtford on 01/02/2014.
 */

var Sequelize = require('sequelize');
var Logger = require('../config').logger;
var Security = require('./security');

exports.sequelize = new Sequelize('vision', 'username', 'password', {
    dialect: 'sqlite',
    storage: ':memory:'
});

exports.User = exports.sequelize.define('User', {
    username: Sequelize.STRING,
    passwordSalt: Sequelize.STRING,
    password: {
        type: Sequelize.STRING,
        get: function () {
            return this.getDataValue('password');
        },
        set: function (password) {
            password = password.trim();
            if (password.length) {
                this.generatePasswordSalt();
                var hashed = this.hashPassword(password);
                this.setDataValue('password', hashed);
            }
            else {
                this.setDataValue('password', null);
            }
        }
    },
    grid: Sequelize.TEXT // Save state of grid.
}, {
    instanceMethods: {
        hashPassword: function (password) {
            return Security.hash(password, this.passwordSalt);
        },
        generatePasswordSalt: function () {
            this.passwordSalt = Security.salt(); // TODO: Apaz SQLLITE has a UUID datatype. Use that instead?
        },
        verifyPassword: function (pass) {
            return this.password === this.hashPassword(pass);
        }
    }
});


exports.Server = exports.sequelize.define('Server', {
    host: Sequelize.STRING,
    port: Sequelize.INTEGER,
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    privateKeyPath: Sequelize.STRING
});