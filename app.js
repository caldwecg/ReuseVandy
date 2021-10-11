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
    /*status: {                                     //could add a status aspect that gets changed to Active upon verification
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },*/
    confirmationCode: Number,
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

app.post("/verify", function (req, res) {

    req.body.
        res.redirect("home")
})

app.post("/", function (req, res) {                     //root page (SignUp page)
    const code = Math.floor(Math.random() * 10000);     //create random verification code
    const emailHandle = "@vanderbilt.edu";

    const user = new User({                             //create new user
        //username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmationCode: code,
    });

    if (user.email.endsWith(emailHandle)) {             //Check for valid Vanderbilt email
        console.log("Valid Email");
    }
    else {
        alert("Enter valid Vanderbilt Email please");
        res.redirect("/")
    }
    const transport = nodemailer.createTransport({      //set up nodemailer transporter with bot email address
        service: "Gmail",
        auth: {
            user: "reusevandy21@gmail.com",
            pass: "CS4278CCCKCWGA2021",
        }
    });

    console.log("Check");
    transport.sendMail({                                            //send the confirmation email to the new user
        from: "reusevandy21@gmail.com",
        to: user.email,
        subject: "Please Confirm Your ReuseVandy Account!",
        html: `<h1>Email Confirmation</h1>
        <h2>Hello</h2>
        <p>Thank you for registering an account on Reuse Vandy! Please confirm your email by clicking on the following link</p>
        <a href=http://localhost:8081/confirm/${user.confirmationCode}> Click here</a>
        </div>`,
    });

    User.insertMany(user, function (err) {
        if (err) {
            console.log(err)
        }
        else {
            console.log("successfully saved user")
            res.redirect("/verify")
        }
    });


})


app.listen(3000, function () {
    console.log("App is listening on port 3000");
})