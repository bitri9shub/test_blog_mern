const { Schema, model } = require('mongoose')

const PostSchema = new Schema({
    title: String,
    summary: String,
    content: String,
    cover: String,
    author: { type: Schema.ObjectId, ref: 'User' }
}, {
    timestamps: true
})

exports.PostModel = model('Post', PostSchema)