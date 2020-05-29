const express = require('express')

require('./database/mongoose')

const userRoute = require('./routes/user')
const taskRoute = require('./routes/task')

const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(userRoute)
app.use(taskRoute)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

