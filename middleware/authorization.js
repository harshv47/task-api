const jwt = require('jsonwebtoken')
const User = require('../model/user')

const authCheck = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        
        const user = await User.findOne({ 'apiToken': token })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: 'Authentication Error' })
    }
}

module.exports = authCheck