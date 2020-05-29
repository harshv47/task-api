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
        //  I have considered the due date of task to be optional, as the user might not have one in mind while creating it
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        //  Using enum validator
        enum: ['1', '2', '3'],
        default: '1'
    }
})

module.exports = Task