/**
 * Created by mtford on 01/02/2014.
 */

var orm = require('./model'),
    Seq = orm.Seq(),
    Security = require('../security');

module.exports = {
    model:{
        username: Seq.STRING,
        passwordSalt: Seq.STRING,
        password: {
            type: Seq.STRING,
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
        grid: Seq.TEXT // Save state of grid.
    },
    relations:{
    },
    options:{
        freezeTableName: true,
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
    }
};