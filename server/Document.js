const { Schema, model } = require('mongoose')

//this schema is essentially dictating what will be there in the object
const Document = new Schema({
    _id: String,
    data: Object,
})


module.exports = model("Document", Document)