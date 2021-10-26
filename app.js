const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose")
const nodemailer = require("nodemailer");


const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"))

mongoose.connect('mongodb://localhost:27017/usersDB')

const postSchema = new mongoose.Schema({
    title: String,
    desc: String,
    price: Number,
    img:
    {
        data: Buffer,
        contentType: String
    }

});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    confirmationCode: Number,
    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    posts: { type: [postSchema] }
});



const User = mongoose.model("User", userSchema);






app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", function (req, res) {
    res.render("signup");
})

app.get("/verify", function (req, res) {
    res.render("verify");
})

app.get("/home", function (req, res) {
    res.render("home");
})

app.get("/failure", function (req, res) {
    res.render("failure");
})

app.get("/signup", function (req, res) {
    console.log('request for signup recieved')
    res.render("signup");
})

app.post("/verify", function (req, res) {

    code = req.body.code;           //verification code entered by user
    console.log(code);

    User.findOne({ confirmationCode: code }, function (err, foundUser) {
        if (!foundUser) {
            console.log("User not found");
            return res.status(404).send({ message: "User Not found." });
        }

        foundUser.status = "Active";
        console.log("user found");
        foundUser.save(function (err, result) {
            if (err) {
                cosole.log(err);
            }
            else {
                console.log(result);
            }
        });

    })

    res.redirect("/home")
})

app.post("/", function (req, res) {
    useremail = req.body.email
    userpassword = req.body.password
    const emailHandle = "@vanderbilt.edu";

    code = Math.floor(Math.random() * 10000);

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'reusevandy@gmail.com',
            pass: 'ReuseVandy2021!'
        }
    });

    var mailOptions = {
        from: 'reusevandy@gmail.com',
        to: useremail,
        subject: 'Verification Code',
        text: 'Your code is: ' + code.toString()
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    const user = new User({
        email: useremail,
        password: userpassword,
        confirmationCode: code
    })

    User.findOne({ email: useremail }, function (err, foundUser) {
        if (/*foundUser == null && */useremail.endsWith(emailHandle)) {
            User.insertMany(user, function (err) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("successfully saved user")
                    res.redirect("/verify")
                }
            });
        }
        else {
            res.redirect("/failure");
        }
    })


})


app.listen(3000, function () {
    console.log("App is listening on port 3000");
})