const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../model/user')

const auth = require('../middleware/authorization')


const router = new express.Router()

router.post('/user/signup', async (req, res) => {
    const user = new User(req.body)
    
    try {
        await user.save()
        
        const token = await user.generateAuthToken()

        res.status(201).send({ 
            error: false,
            user, 
            token
        })
    } catch (e) {
        res.status(400).send({
            error: true,
            message: "Bad Request"
        })
    }
})


router.post('/user/login', async (req, res) => {
    try {
        
        const user = await User.findByCredentials(req.body.email, req.body.password)
        
        if(!user){
            return res.status(404).send({
                error: true,
                message: "Invalid credentials"
            })
        }

        res.send({
            error: false,
            message: "Logged in Successfully",
            apiToken: user.apiToken
        })
        //  Issue token here, identify what that means!!!
    } catch (e) {
        res.status(400).send({
            error: true,
            message: "Bad Request"
        })
    }
})

router.post('/user/createApiToken', async (req, res) => {
    try {   

        if(parseInt(req.body.expiresIn) <= Date.now()/1000){
            return res.status(400).send({ error: true, message: "Token is expired" })
        }
        
        const token = jwt.sign({ _id: req.body.expiresIn }, process.env.JWT_SECRET)
        token.exp = parseInt(req.body.expiresIn)

        res.send({
            apiToken: token
        })
    } catch (e) {
        res.status(400).send({
            error: true,
            message: "Bad Request"
        })
    }
})



module.exports = router