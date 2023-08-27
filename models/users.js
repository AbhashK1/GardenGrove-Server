const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    address: {
        address: String,
        city: String,
        state: String,
        zip: String
    },
    premiumUser:Boolean,
})

const User = mongoose.model('user', userSchema);
module.exports=User