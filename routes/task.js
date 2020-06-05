const express = require('express')

const Task = require('../model/task')
const auth = require('../middleware/authorization')

const router = new express.Router()

router.get('/task/list', auth ,async (req, res) => {
    try {
        
        //  Finding all the tasks created by the user
        const tasks = await Task.find({ uId: req._id })

        //  If the previous operation was a scuccess, then send an affirmative reply
        res.status(202).send({
            error: false,
            tasks
        })

    } catch (e) {
        res.status(500).send({
            error: true,
            message: "Internal Server Error"
        })
    }
})

router.post('/task/create', auth ,async (req, res) => {
    try{

        //  Creating a new object from the Task schema
        const task = new Task()
        
        //  Defining the properties of the newly created task
        task.uId = req._id
        task.dueOn = req.body.dueOn
        task.title = req.body.title
        task.status = req.body.status

        //  Saving the task to the task collection
        await task.save()

        res.status(200).send({
            error: false,
            message: "The task has been created"
        })
    } catch (e){
        res.status(400).send({
            error: true,
            message: "Bad Request"
        })
    }
})

router.get('/task/:id', auth ,async (req, res) => {
    
    //  Getting the ID from the parameter
    const _id = req.params.id
    
    try {
        //  Searching the collection for a task with same ID
        const task = await Task.findById(_id)

        if (!task) {
            return res.status(404).send({
                error: true,
                message: "Task not found"
            })
        }

        res.send({
            error: false,
            task
        })
    } catch (e) {
        res.status(500).send({
            error: true,
            message: "Internal server Error"
        })
    }
})

router.patch('/task/:id/complete', auth, async (req, res) => {
    
    //  These lines are for only allowing updating the status field and will result in an error if any other field is changed.
    const updates = Object.keys(req.body)
    const allowedUpdates = ['status']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: true, 
            message: 'Invalid Operation' 
           })
    }

    try {

        //  Finding the task by using the input id parameter
        const task = await Task.findById(req.params.id)

        //  In the enum status, '2' means a task has been completed
        task.status = '2'
        await task.save()
        
        if (!task) {
            return res.status(404).send()
        }

        res.status(202).send({
            error: false,
            message: "The tasked was marked as completed"
        })
    } catch (e) {
        res.status(400).send({
            error: true,
            message: "Bad Request"
        })
    }
})

router.patch('/task/:id/archive', auth, async (req, res) => {

    //  Similar to the above case, change in only status field is allowed
    const updates = Object.keys(req.body)
    const allowedUpdates = ['status']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
             error: true, 
             message: 'Invalid Operation' 
            })
    }

    try {

        //  Finding task by using the input ID parameter
        const task = await Task.findById(req.params.id)

        //  In the enum status, '3' means a task has been completed
        task.status = '3'
        await task.save()
        
        if (!task) {
            return res.status(404).send({
                error: true,
                message: "Task not found"
            })
        }

        res.status(202).send({
            error: false,
            message: "The task was archived"
        })
    } catch (e) {
        res.status(400).send({
            error: true,
            message: "Bad Request"
        })
    }
})

module.exports = router