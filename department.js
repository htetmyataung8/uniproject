
const Sequelize = require('sequelize');
const sequelize = require('../../utils/dbconnector');

const company = require('../company/company');

const login = require('../management/login');

const department = sequelize.define('tbldepartment',{
    id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
    tenantid: { type: Sequelize.UUID, allowNull: false },
    compid: { type: Sequelize.UUID, allowNull: false },
    deptype: { type: Sequelize.STRING, allowNull: false },
    name: {type: Sequelize.STRING, allowNull: false},
    code: { type: Sequelize.STRING, allowNull: false },
    desc: { type: Sequelize.STRING, allowNull: false },
    hod_name: { type: Sequelize.STRING, allowNull: false },
    hod_email: { type: Sequelize.STRING, allowNull: false },
    sts: { type: Sequelize.CHAR, allowNull: false },
    createdby: { type: Sequelize.UUID, allowNull: false},
});

company.hasMany(department,{foreignKey: 'compid', onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});
department.belongsTo(company,{foreignKey: 'compid', onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});

login.hasMany(department,{foreignKey: 'createdby', onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});
department.belongsTo(login,{foreignKey: 'createdby', onDelete: 'RESTRICT', onUpdate: 'RESTRICT'});


module.exports = department;