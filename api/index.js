const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs')

const app = express()

const { UserModel } = require('./models/user')
const { PostModel } = require('./models/post')

const salt = bcrypt.genSaltSync(10)
const secret = '&é\'^plâl\'lpoka"op\'originAgentCluster,oiq,i'

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(__dirname + '/uploads'))

mongoose.connect('mongodb://localhost:27017/blog')

app.post('/register', async function (req, res) {
    try {
        const { username, password } = req.body
        const userDoc = await UserModel.create({
            username,
            password: bcrypt.hashSync(password, salt)
        })
        res.json(userDoc)
    } catch (error) {
        res.status(400).json(error)
        // res.status(400).json(error.errorResponse.errmsg)
    }
})

app.post('/login', async function (req, res) {
    const { username, password } = req.body
    const userDoc = await UserModel.findOne({ username })
    const passOk = bcrypt.compareSync(password, userDoc.password)
    if (passOk) {
        jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
            if (err) throw err
            res.cookie('token', token).json({
                id: userDoc._id,
                username
            })
        })
    } else {
        res.status(400).json('wrong credentials')
    }
})

app.get('/profile', function (req, res) {
    const { token } = req.cookies
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) throw err
        res.json(info)
    })
})

app.post('/logout', function (req, res) {
    res.cookie('token', '').json('ok')
})

app.post('/post', uploadMiddleware.single('file'), async function (req, res) {
    const { originalname, path } = req.file
    const parts = originalname.split('.')
    const ext = parts[parts.length - 1]
    const newPath = path + '.' + ext
    fs.renameSync(path, newPath)
    const { token } = req.cookies
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err
        const { title, summary, content } = req.body
        const postDoc = await PostModel.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id
        })
        res.json(postDoc)
    })

})

app.get('/post', async function (req, res) {
    res.json(
        await PostModel.find()
            .populate('author', ['username'])
            .sort({ createdAt: -1 })
            .limit(20)
    )
})

app.get('/post/:id', async function (req, res) {
    const { id } = req.params
    const post = await PostModel
        .findOne({ _id: id })
        .populate('author', ['username'])
    res.json(post)
})

app.put('/post', uploadMiddleware.single('file'), async function (req, res) {
    let newPath = null
    if (req.file) {
        const { originalname, path } = req.file
        const parts = originalname.split('.')
        const ext = parts[parts.length - 1]
        const newPath = path + '.' + ext
        fs.renameSync(path, newPath)
    }

    const { token } = req.cookies
    jwt.verify(token, secret, {}, async (err, info) => {
        if (err) throw err
        const { id, title, summary, content } = req.body
        const postDoc = await PostModel.findById(id)
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id)
        if (!isAuthor) res.status(400).json('you are not the author')

        await postDoc.updateOne({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover
        })
        res.json(postDoc)
    })
})

app.listen(4000)