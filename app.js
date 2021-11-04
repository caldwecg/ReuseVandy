const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose")
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');


const app = express();


app.use(sessions({
    secret: "thisismysecrct",
    saveUninitialized:true,
    resave: false
}));

app.use(cookieParser());

var sess;

app.set('view engine', 'ejs');
app.use(express.static("public"))

mongoose.connect('mongodb://localhost:27017/usersDB')

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



const User = mongoose.model("User", userSchema);

const Post = mongoose.model("Post", postSchema);


var bcrypt = require("bcryptjs");


app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", function (req, res) {
    sess = req.session
    if(sess.email && sess.password){
        return res.render("home");
    }
    else{
        res.render("login")
    }

})

app.get('/logout', function(req,res) {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });
});

app.get("/sell", function (req, res) {
    sess = req.session
    if(sess.email && sess.password){
        return res.render("sell");
    }
    else{
        res.render("login")
    }
})

app.get("/verify", function (req, res) {
    res.render("verify");
})

app.get("/home", function (req, res) {
    sess = req.session
    if(sess.email && sess.password){
        return res.render("home");
    }
    else{
        res.render("login")
    }
})

app.get("/failure", function (req, res) {
    res.render("failure");
})

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

app.post("/verify", function (req, res) {
    code = req.body.code;           //verification code entered by user
    console.log(code);

    User.findOne({ confirmationCode: code }, function (err, foundUser) {
        if (!foundUser) {
            console.log(code)
            console.log("User not found");
            return res.status(404).send({ message: "User Not found." });
        }
        else {
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
            res.redirect("/login")
        }


    })


})

app.post("/signup", function (req, res) {
    useremail = req.body.email
    // userpassword = bcrypt.hashSync(req.body.password, 8)
    userpassword = req.body.password
    const emailHandle = "@vanderbilt.edu";

    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters[Math.floor(Math.random() * characters.length)];
    }
    console.log(code);
    //code = Math.floor(Math.random() * 10000);

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
        text: 'Your code is: ' + code
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
        if (foundUser == null && useremail.endsWith(emailHandle)) {
            User.insertMany(user, function (err) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log("successfully saved user")

                    //res.redirect('/verify?user=' + useremail)
                    res.redirect("/verify")
                }
            });
        }
        else {
            res.redirect("/failure");
        }
    })


})

app.post("/login", function (req, res) {
    useremail = req.body.email
    userpassword = req.body.password

    sess = req.session;
    sess.email = useremail;
    sess.password = userpassword;



    User.findOne({ email: useremail, password: userpassword, status: "Active" }, function (err, foundUser) {

        if (err) {
            console.log(err);

        }

        if (!foundUser) {
            console.log("User not found");
            return res.status(404).send({ message: "User Not found." });
        }
 
        // if (foundUser.status == "Pending") {
        //     res.status(404).send({ message: "Pending Account. Please confrim in your Email" });
        //     res.redirect('/verify');
        // }

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

        res.redirect("/home")
    })


})


app.listen(3000, function () {
    console.log("App is listening on port 3000");
})