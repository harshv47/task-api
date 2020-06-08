const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



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
        minlength: 7
    },
    apiToken: {
        //  I had thought of this part being a token array rather just a single value
        type: String
    },
    apiExpiresAt: {
        //  So I stored it as String and whenever it is required, I use parseInt() to convert it back
        type: String,
        //  This setter doesn't work
        //set: d => new Date(d * 1000)
    }
})

userSchema.methods.generateAuthToken = async function () {
    
    //  I was confused on whether I should use the token generated from the createapiToken, so I created new ones.
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET, {
        expiresIn: '1 day'
    })
    
    //  Setting token property
    this.apiToken = token
    const decoded = jwt.decode(token)
    
    //  Setting ExpiresAt property
    this.apiExpiresAt = decoded.exp
    await this.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {

    //  Finding the user using email first
    const user = await User.findOne({ email })
    
    //  Checking if the user exists
    if (!user) {
        throw new Error('Invalid Credentials')
    }

    //  Comparing the password of the matched email
    //  Storing base64 encypted form of password
    const isMatch = await bcrypt.compare(password, user.password)

    //  Checking if the password is the same
    if (!isMatch) {
        throw new Error('Invalid Credentials')
    }

    return user
}



// Hash the plain text password before saving
//  This middleware runs before the save operation in mongoose
userSchema.pre('save', async function (next) {

    if (this.isModified('password')) {
        //  Runing it for 7 rounds
        this.password = await bcrypt.hash(this.password, 7)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User