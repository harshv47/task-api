const express = require('express')
const Task = require('../model/task')
const auth = require('../middleware/authorization')

const router = new express.Router()

router.get('/task/list', auth ,async (req, res) => {
    try {
        //console.log(req.user)
        const tasks = await Task.find({ uId: req.user._id })
        res.send(tasks)
        //res.status(200).send()
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.post('/task/create', auth ,async (req, res) => {
    try{

        const task = new Task()
        
        task.uId = req.user._id
        task.dueOn = req.body.dueOn
        task.title = req.body.title
        task.status = req.body.status

        console.log(task)

        await task.save()
        res.status(200).send()
    } catch (e){
        console.log(e)
        res.status(400).send()
    }
})

router.get('/task/:id', auth ,async (req, res) => {
    console.log(req)
    const _id = req.params.id
    console.log(_id)
    try {
        const task = await Task.findById(_id)

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/task/:id/complete', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['status']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Operation' })
    }

    try {
        const task = await Task.findById(req.params.id)

        task.status = '2'
        await task.save()
        console.log(task)
        if (!task) {
            return res.status(404).send()
        }

        res.status(202).send()
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/task/:id/archive', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['status']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Operation' })
    }

    try {
        const task = await Task.findById(req.params.id)

        task.status = '3'
        await task.save()
        console.log(task)
        if (!task) {
            return res.status(404).send()
        }

        res.status(202).send()
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router