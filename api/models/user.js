const { Schema, model } = require('mongoose')

const UserSchema = new Schema({
    username: { type: String, required: true, min: 4, unique: true },
    password: { type: String, required: true }
})

exports.UserModel = model('User', UserSchema)