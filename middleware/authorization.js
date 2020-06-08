const jwt = require('jsonwebtoken')

const User = require('../model/user')
const Tokens = require('../model/apiToken')

const authCheck = async (req, res, next) => {
    try {
        // Using Bearer Token, so removing "Bearer " from the Auth header
        const token = req.header('Authorization').replace('Bearer ', '')
        
        //  Finding the user in the user collection
        const user = await User.findOne({ 'apiToken': token })
        const apiToken = await Tokens.findOne({ 'apiToken': token})

        expiresAt = (!user)?apiToken.apiExpiresAt:user.apiExpiresAt

        //  Checking if the token has already expired
        if(parseInt(expiresAt) <= Date.now()/1000){
            throw new Error({
                error: true,
                message: "Token is expired"
            })
        }

        //  If the query returns null, then the user doesn't exist
        if (!user && !apiToken) {
            throw new Error()
        }

        //  Saving this information in the request, so that these can be accessed in all auth middleware routes
        req.token = token
        req._id = (!user)?apiToken._id:user._id
        next()
    } catch (e) {

        res.status(401).send({ 
            error: true,
            message: 'Authentication Error' 
    })
    }
}

module.exports = authCheck