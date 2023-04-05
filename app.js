const express = require('express')

const path = require('path')
const bodyParser = require('body-parser')
var cors = require('cors')

const sequelize = require('./database/database')
const rootDir = require('./util/path')

const userRoute = require('./routes/routes')
const expenseRoute = require('./routes/expense')
const purchaseRoute = require('./routes/purchase')

const User = require('./modals/userModal')
const Expense = require('./modals/expenseModal')
const Order = require('./modals/orderModal')

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors())

app.use(userRoute)
app.use(expenseRoute)
app.use(purchaseRoute)

User.hasMany(Expense)
Expense.belongsTo(User)

User.hasMany(Order)
Order.belongsTo(User)

sequelize
.sync()
.then( result =>{
    app.listen(8000,() =>{
        console.log('Server listening on port 8000')
    })

})