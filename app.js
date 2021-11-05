//Reuse Vandy Application 
//CS 4278 - Fall 2021
//Group 3
//Carter Caldwell, Caroline Kiesling, Clayton Wright, Geoffrey Anapolle


//Packages required for the application
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose")
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');


const app = express();

//Establishes a User Session sess to supervise user acess
app.use(sessions({
    secret: "thisismysecrct",
    saveUninitialized: true,
    resave: false
}));

app.use(cookieParser());

var sess;

//Denotes the Viewing Engine as ejs
app.set('view engine', 'ejs');
app.use(express.static("public"))

//Connects project to database
mongoose.connect('mongodb://localhost:27017/usersDB')

//Defines the structure of a Post to be stored in the database
const postSchema = new mongoose.Schema({
    title: String,
    desc: String,
    price: Number,
    condition: String,
    category: String,
    phone: Number,
    img:
    {
        data: Buffer,
        contentType: String
    }

});

//Defines the structure of a User to be stored in the database
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    confirmationCode: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Active'],
        default: 'Pending'
    },
    posts: { type: [postSchema] }
});


//Creates instance of project database
const User = mongoose.model("User", userSchema);

const Post = mongoose.model("Post", postSchema);

var bcrypt = require("bcryptjs");


app.use(bodyParser.urlencoded({ extended: true }))

//Client requests root page. If the user is logged in to a session, user is directed to home page.
//Otherwise, user is directed to login page.
app.get("/", function (req, res) {
    sess = req.session
    if (sess.email && sess.password) {
        return res.render("home");
    }
    else {
        res.render("login")
    }

})

//Client Request to end their session; redirects to the login page after session destruction.
app.get('/logout', function (req, res) {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});

//Client request to view sell page. Only renders if user is logged in, otherwise redirects to login page
app.get("/sell", function (req, res) {
    sess = req.session;
    if(sess.email && sess.password){
        return res.render("sell");
    }
    else{
        res.render("login")
    }
})

//Renders verification page (following an account creation)
app.get("/verify", function (req, res) {
    res.render("verify");
})

//Renders home page. Only renders if user is logged in, otherwise redirects to login page
app.get("/home", function (req, res) {
    sess = req.session
    if (sess.email && sess.password) {
        return res.render("home");
    }
    else {
        res.render("login")
    }
})

//Renders a failure page if invalid emails are given during account creation
app.get("/failure", function (req, res) {
    res.render("failure");
})

//Renders signup page when Client 
app.get("/signup", function (req, res) {
    console.log('request for signup recieved')
    res.render("signup");
})




app.get("/profile", function (req, res) {
    sess = req.session
    if(sess.email && sess.password){
        return res.render("profile");
    }
    else{
        res.render("login")
    }
})

app.get("/buy", function (req, res) {
    sess = req.session
    if(sess.email && sess.password){
        Post.find({}, function (err, foundPosts) {
            if (!foundPosts) {
                return res.status(404).send({ message: "No posts found." });
            }
            else {
                console.log("posts found");
            
            }
            return res.render("buy", {posts: foundPosts});

        })
    }
    else{
        res.render("login")
    }
})

app.get("/search", function (req, res) {
    keywords = req.body.keywords;
    console.log(keywords)

    sess = req.session
    if(sess.email && sess.password){
        Post.find({}, function (err, foundPosts) {
            if (!foundPosts) {
                return res.status(404).send({ message: "No posts found." });
            }
            else {
                console.log("posts found");
            
            }
            return res.render("search", {posts: foundPosts});

        })
    }
    else{
        res.render("login")
    }
})

app.post("/buy", function (req, res) {



    res.redirect("/search")

})

app.post("/sell", function (req, res) {
    title = req.body.title;
    desc = req.body.description;
    price = req.body.price;
    phone = req.body.phone;
    img = req.body.file;

    console.log(title)
    console.log(desc)
    console.log(price)
    console.log(phone)
    console.log(img)

    const post = new Post({
        title: title,
        desc: desc,
        price: price,
        phone: phone
    });

    Post.insertMany(post, function (err) {
        if (err) {
            console.log(err)
        }
        else {
            console.log("successfully saved post")

            res.redirect("/profile")
        }
    });
})


//Functionality for the Verification Page.
app.post("/verify", function (req, res) {
    code = req.body.code;           //verification code entered by user
    console.log(code);

    //Finds a user in the database with the unique verification code entered
    User.findOne({ confirmationCode: code }, function (err, foundUser) {

        //If no user found with code, notify user
        if (!foundUser) {
            console.log(code)
            console.log("User not found");
            return res.status(404).send({ message: "User Not found." });
        }
        //If user is found with code...
        else {
            foundUser.status = "Active";            //Active account
            console.log("user found");
            foundUser.save(function (err, result) {     //Save updates to User database
                if (err) {
                    cosole.log(err);
                }
                else {
                    console.log(result);
                }
            });
            res.redirect("/login")           //User is redirected to login for first time

        }


    })


})

//Functionality for the Account Creation Page
app.post("/signup", function (req, res) {

    useremail = req.body.email                                         //Reads username and email
    //userpassword = bcrypt.hashSync(req.body.password, 8)
    userpassword = req.body.password

    const emailHandle = "@vanderbilt.edu";

    //Creates a unique confirmation code for account verification
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    console.log(code);

    //Creates a Nodemailer transporter (3rd-Party API for email verification)
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'reusevandy@gmail.com',              //gmail account that will automatically send codes
            pass: 'ReuseVandy2021!'
        }
    });

    //Creates the Confirmation Email layout
    var mailOptions = {
        from: 'reusevandy@gmail.com',
        to: useremail,
        subject: 'Verification Code',
        html: `<h1>Email Confirmation</h1>
        <h2>Hello</h2>
        <p>Thank you for registering an account. Please confirm your Vanderbilt email with the following code.</p>
        <strong>${code}</strong>
        </div>`,
    };

    //Transporter sends the email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    //Creates a new user with specified email and password
    const user = new User({
        email: useremail,
        password: userpassword,
        confirmationCode: code
    })


    User.findOne({ email: useremail }, function (err, foundUser) {

        //Checks User Database if entered email is a valid Vanderbilt address and is not already taken.
        if (/*foundUser == null && */useremail.endsWith(emailHandle)) {
            User.insertMany(user, function (err) {          //Saves new user to database
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("successfully saved user")

                    res.redirect("/verify")                 //redirects new user to the verification page
                }
            });
        }
        else {
            res.redirect("/failure");               //Invalid emails and taken users get redirected to failure page
        }
    })


})

//Functionality of Login Page
app.post("/login", function (req, res) {

    //Reads entered email and password
    useremail = req.body.email
    userpassword = req.body.password

    //Creates a user session with entered email and password
    sess = req.session;
    sess.email = useremail;
    sess.password = userpassword;


    //Checks User database to ensure email and password are correct



    User.findOne({ email: useremail, password: userpassword, status: "Active" }, function (err, foundUser) {
        if (err) {
            console.log(err);

        }

        //Invalid email or password
        if (!foundUser) {
            console.log("User not found");
            return res.status(404).send({ message: "User Not found." });
        }

        //User account still pending (email not verified)
        if (foundUser.status == "Pending") {
            //res.status(404).send({ message: "Pending Account. Please confrim in your Email" });
            res.redirect("/verify");
        }


        //Incomplete Feature: Password encryption
        // var isValidPass = bcrypt.compareSync(userpassword, foundUser.password);
        // if (isValidPassword) {
        //     console.log("Valid Password");
        // }
        // else {
        //     console.log("Invalid Password");
        // }

        // if (foundUser.password) {
        //     console.log("User not found");
        //     return res.status(404).send({ message: "User Not found." });
        // }

        console.log("user found");
        res.redirect("/home")               //Renders Home Page after successful login
    })


})


app.listen(3000, function () {
    console.log("App is listening on port 3000");
})