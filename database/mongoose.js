const mongoose = require('mongoose')


//  This is a separate file to store the mongoose options

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})