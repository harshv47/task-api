const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
//const moment = require('moment')



// users
// {
//     _id: 210212121212add1,
//     name: "Kamlesh Chetnani",
//     email: "kamlesh@saleshandy.com",
//     password: "pass123",
//     apiToken: "asdasdjasjhj12hjkh21j2j12",
//     apiExpiresAt: 1590644190     //  Check if apiExpiresAt is added automatically
// }

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide an email'],
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {             
        type: String,
        required: [true, 'Please provide a password'],
        trim: true,
        minlength: 7,
        validator: function(value) {
            return /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$/.test(value);
          },
          message: 'The password must contain at least one lowercase, one uppercase and one number'
    },
    apiToken: { // If the user has multiple tokens
        type: String
    },
    apiExpiresAt: {
        type: String,
        //set: d => new Date(d * 1000)
    }
})

userSchema.methods.generateAuthToken = async function () {
    const token = jwt.sign({ _id: this._id.toString() }, 'SalesHandy', {
        expiresIn: '1 day'
    })
    
    this.apiToken = token
    const decoded = jwt.decode(token)
    console.log(decoded.exp)
    this.apiExpiresAt = decoded.exp
    await this.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    
    if (!user) {
        throw new Error('Invalid Credentials')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Invalid Credentials')
    }

    return user
}



// Hash the plain text password before saving
userSchema.pre('save', async function (next) {

    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 7)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User