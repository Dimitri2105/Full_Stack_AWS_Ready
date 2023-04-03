const Sequelize = require('sequelize')

const sequelize = new Sequelize('node-to-do','root','Tarathakur@21',{
    host:'localhost',
    dialect:'mysql'
})

module.exports = sequelize