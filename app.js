require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cors = require("cors")




app.use(
    cors({
        origin: "*"
    })
)
app.use(bodyParser.json())
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const userSchema = { emailID: String, username: String, password: String }
const User = mongoose.model('User', userSchema)


app.post('/register', (req, res) => {



    User.find({ username: req.body.username }, function (err, founduser) {
        if (err) {
            res.send(err);
        }
        else if (founduser.length) {

            res.send(`User with username: ${founduser[0].username} already exist.`)
        } else {

            User.find({ emailID: req.body.emailID }, function (err1, founduser1) {
                if (err1) {
                    res.send(err1)
                } else if (founduser1.length) {

                    res.send(`User with Email ID: ${founduser1[0].emailID} already exist.`)
                } else {
                    const user = new User(req.body)
                    user.save();
                    res.send('User registered. Please login.')
                }
            })

        }
    });


})

app.post('/login', (req, res) => {


    User.find({ emailID: req.body.emailID }, function (err, founduser) {
        if (err) {
            res.send(err)
        } else if (founduser.length == 0) {
            res.send(`No user with Email ID: ${req.body.emailID} exist. Please register.`)
        } else {
            if (founduser[0].password != req.body.password) {

                res.send('Invalid password.')
            } else {

                const user = {
                    email: founduser[0].emailID,
                    username: founduser[0].username
                }

                jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '30m' }, (err, token) => {
                    res.send({
                        message: 'Login Successful. Use token to see user details.',
                        token: token
                    })
                })
            }
        }
    })
})

app.get('/try/access/:token', (req, res) => {
    const token = req.params.token

    jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
        if (err) {
            res.send(err)
        } else {
            res.send(data)
        }
    })
})



app.listen(3000, () => {
    console.log('Server has started...')
})