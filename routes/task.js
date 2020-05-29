const express = require('express')
const Task = require('../model/task')
const auth = require('../middleware/authorization')

const router = new express.Router()

router.get('/task/list', auth ,async (req, res) => {
    try {
        
        const tasks = await Task.find({ uId: req.user._id })

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

        const task = new Task()
        
        task.uId = req.user._id
        task.dueOn = req.body.dueOn
        task.title = req.body.title
        task.status = req.body.status

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
    
    const _id = req.params.id
    
    try {
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
        const task = await Task.findById(req.params.id)

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
        const task = await Task.findById(req.params.id)

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