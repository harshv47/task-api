const mongoose = require('mongoose');

// apiToken
// {
//     _id: 210212121212add1,
//     apiToken: "asdasdjasjhj12hjkh21j2j12",
//     apiExpiresAt: 1590644190     //  Check if apiExpiresAt is added automatically
// }

const apiSchema = new mongoose.Schema({

  apiToken: {
    //  I had thought of this part being a token array rather just a single value
    type: String,
    required: true,
  },
  apiExpiresAt: {
    type: Number,
    required: true,
    //  This setter doesn't work
    // set: d => new Date(d * 1000)
  },

});

const Tokens = mongoose.model('Tokens', apiSchema);

module.exports = Tokens;
