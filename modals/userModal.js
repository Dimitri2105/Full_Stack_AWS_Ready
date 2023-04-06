const Sequelize = require('sequelize')

const sequelize = require('../database/database')

const User = sequelize.define('user',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    userName:{
        type:Sequelize.STRING,
        allowNull:false
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    isPremiumUser:Sequelize.BOOLEAN,
    totalExpenses:{
        type:Sequelize.INTEGER,
        defaultValue:0
    }

})

module.exports = User