const Sequelize = require('sequelize'); //dbconnector to sync with the databasse
const sequelize = require('../../utils/dbconnector');//dbconnector to sync with the databasse

const login = require('../management/login');
const { PrimaryKey } = require('@sequelize/core/decorators-legacy');

const school = sequelize.define('tblschool', {
    id: { type: Sequelize.UUID, allowNull: false, PrimaryKey: true },
    name: {type: Sequelize.STRING, allowNull: false},
    class: { type: Sequelize.INTEGER, allowNull: false },
    section: {type: Sequelize.CHAR, allowNull: false},
    roll: {type: Sequelize.INTEGER, allowNull:false},
    sts: {type: Sequelize.BOOLEAN, allowNull: false},
     createdby: { type: Sequelize.UUID, allowNull: false},
}
);

login.hasMany(school,{foreignKey: 'createdby', onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});
school.belongsTo(login,{foreignKey: 'createdby', onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});

module.exports = school;
