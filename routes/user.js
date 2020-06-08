const express = require('express')
const jwt = require('jsonwebtoken')

const User = require('../model/user')
const Tokens = require('../model/apiToken')
const auth = require('../middleware/authorization')


const router = new express.Router()

router.post('/user/signup', async (req, res) => {

    //  Checking password strength
    passreg = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$")

    if(!passreg.test(req.body.password)){
        return res.status(400).send({
            error: false,
            message: 'The password must contain at least one lowercase, one uppercase and one number'
        })
    }

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

        res.status(202).send({
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
        
        // Checking to see if the user has provided expiry date
        if(!req.body.expiresAt){
            return res.status(400).send({
                error: true,
                message: "No expiry date provided"
            })
        }

        //  Checking to see if the token has already expired or not
        if(parseInt(req.body.expiresAt) <= Date.now()/1000){
            return res.status(400).send({ error: true, message: "Token is expired" })
        }
        
        //  Using exipiration unix timestamp as the key for signing jwt token
        const token = jwt.sign({ _id: req.body.expiresAt, exp: parseInt(req.body.expiresAt) }, process.env.JWT_SECRET)


        //  Creating the entry for tokens collection
        const apiToken = new Tokens()
        apiToken.apiToken = token
        apiToken.apiExpiresAt = parseInt(req.body.expiresAt)

        await apiToken.save()

        res.send({
            error: false,
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