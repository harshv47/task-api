const express = require('express')
const jwt = require('jsonwebtoken')

const User = require('../model/user')
const Tokens = require('../model/apiToken')
const auth = require('../middleware/authorization')


const router = new express.Router()

router.post('/user/signup', async (req, res) => {

    //  Creating a user object using the User schema
    const user = new User(req.body)
    
    try {
        
        //  Creating an apToken for the new user
        const token = await user.generateAuthToken()
        user.apiToken = token

        //  Saving the user in the User Collection
        await user.save()

        res.status(201).send({ 
            error: false,
            user,
            //  Sending the token back, so that the user could use the Bearer token 
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
        
        //  Finding the user by there credentials
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
            //  Sending the apiToken, so that the user could use the Bearer Token
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

        //  Checking to see if the token has already expired or not
        if(parseInt(req.body.expiresAt) <= Date.now()/1000){
            return res.status(400).send({ error: true, message: "Token is expired" })
        }
        
        //  Using exipiration unix timestamp as the key for signing jwt token
        const token = jwt.sign({ _id: req.body.expiresAt }, process.env.JWT_SECRET)
        token.exp = parseInt(req.body.expiresAt)

        //  Creating the entry for tokens collection
        const apiToken = new Tokens()
        apiToken.apiToken = token
        apiToken.apiExpiresAt = req.body.expiresAt

        await apiToken.save()

        res.send({
            error: false,
            apiToken: token
        })

    } catch (e) {
        console.log(e)
        res.status(400).send({
            error: true,
            message: "Bad Request"
        })
    }
})



module.exports = router