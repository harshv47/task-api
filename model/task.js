const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

// tasks
// {
//     _id: 434343423adasd12, // Defualt - NO need
//     uId: 210212121212add1, // 
//     dueOn: 1590644190,
//     title: "Test task"
//     status: 1
// }

const Task = mongoose.model('Task', {
    uId: {
        type: String,
        required: [true, 'User ID of the task issuer is required']
    },
    dueOn: {
        type: String
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['1', '2', '3'],
        default: '1'
    }
})

module.exports = Task