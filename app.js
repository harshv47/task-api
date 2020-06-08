const express = require('express')

require('./database/mongoose')

const userRoute = require('./routes/user')
const taskRoute = require('./routes/task')

const app = express()


app.use(express.json())
app.use(userRoute)
app.use(taskRoute)


module.exports = app