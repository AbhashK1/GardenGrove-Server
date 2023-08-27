const mongoose = require('mongoose')

const QuerySchema = new mongoose.Schema({
    firstName: String,
    email: String,
    phoneNumber: String,
    query: String,
})

const QueryModel = mongoose.model("query", QuerySchema)
module.exports = QueryModel