const jwt = require('jsonwebtoken')
const User = require('../model/user')

const authCheck = async (req, res, next) => {
    try {
        // Using Bearer Token, so removing "Bearer " from the Auth header
        const token = req.header('Authorization').replace('Bearer ', '')
        
        //  Finding the user in the user collection
        const user = await User.findOne({ 'apiToken': token })

        //  If the query returns null, then the user doesn't exist
        if (!user) {
            throw new Error()
        }

        //  Saving this information in the request, so that these can be accessed in all auth middleware routes
        req.token = token
        req.user = user
        next()
    } catch (e) {
        
        res.status(401).send({ 
            error: true,
            message: 'Authentication Error' 
    })
    }
}

module.exports = authCheck