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
const bcrypt = require("bcryptjs");


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
    date: Date,
    tags: [String],
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


//Creates instance of project databases
const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);


app.use(bodyParser.urlencoded({ extended: true }))


//Client requests root page. If the user is logged in to a session, user is directed to home page.
//Otherwise, user is directed to login page.
app.get("/", function (req, res) {
    sess = req.session
    if (sess.email) {
        return res.render("home");
    }
    else {
        res.render("login")
    }

})


//Client Request to end their session; redirects to the login page after session destruction.
app.get("/logout", function (req, res) {
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
    if (sess.email) {
        return res.render("sell");
    }
    else {
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
    if (sess.email) {
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
    res.render("signup", { alerts: [0, 0, 0] });
})


//Renders user profile as long as there is a valid session. Otherwise, redirects to login page
app.get("/profile", function (req, res) {
    sess = req.session

    if (sess.email) {
        User.find({ email: sess.email }, function (err, foundUser) {
            if (!foundUser) {
                return res.status(404).send({ message: "No User posts found." });
            }
            else {
                console.log("User posts found");

            }
            const posts = foundUser.posts;
            console.log(posts);
            return res.render("profile", { myPosts: foundUser });

        })
    }
    else {
        res.render("login")
    }
})



//Client request for Buy page is handled here. Renders the Buy Page with
//recent item listings; most recently created listings appearing at the top
app.get("/buy", function (req, res) {
    sess = req.session
    if (sess.email) {
        Post.find({}, function (err, foundPosts) {
            if (!foundPosts) {
                return res.status(404).send({ message: "No posts found." });
            }
            else {
                console.log("posts found");

                //sorts foundPosts by date
                foundPosts.sort(sortByDate("date"));
                //console.log(foundPosts)
            }
            return res.render("buy", { posts: foundPosts });

        })
    }
    else {
        res.render("login")
    }
})


//Handling of a client item search
app.get("/search", function (req, res) {

    //Parses search bar for the keywords entered by user
    keywords = req.query.keywords.replace(/ +/g, " ").split(" ")

    //Forces all keywords to be lowercase for search purposes
    for (var i = 0; i < keywords.length; ++i) {
        keywords[i] = keywords[i].toLowerCase();
    }

    console.log(keywords)
    regex = keywords.join("|");
    console.log(regex)

    //Searches Posts DB for listings containing keyword in Title/Description
    sess = req.session
    if (sess.email) {
        Post.find({ tags: { $in: regex } }, function (err, foundPosts) {
            if (!foundPosts) {
                return res.status(404).send({ message: "No posts found." });
            }
            else {
                console.log("posts found");
                console.log(foundPosts);

                //sorts foundPosts by date
                foundPosts.sort(sortByDate("date"));
            }
            return res.render("search", { posts: foundPosts });

        })
    }
    else {
        res.render("login")
    }
})


//Server Response to a search on the Buy Page. Keywords are passed in the URL to be processed
//on the search page
app.post("/buy", function (req, res) {
    res.redirect('/search?keywords=' + req.body.keywords)

})


//Functionality for listing creation
app.post("/sell", function (req, res) {
    sess = req.session


    //Reads listing information from the form
    title = req.body.title;
    desc = req.body.description;
    price = req.body.price;
    phone = req.body.phone;
    img = req.body.file;

    //Creates tags for listing based on Title and Description
    const titleTags = req.body.title.replace(/ +/g, " ").split(" ")
    const descriptionTags = req.body.description.replace(/ +/g, " ").split(" ")
    tags = titleTags.concat(descriptionTags)

    //Forces all tags to be lowercase for search purposes
    for (var i = 0; i < tags.length; ++i) {
        tags[i] = tags[i].toLowerCase();
    }

    //Saves the current date and time of listing creation
    var currentDate = new Date();
    date = currentDate;

    console.log(title)
    console.log(desc)
    console.log(price)
    console.log(phone)
    console.log(date)
    console.log(tags)


    const post = new Post({
        title: title,
        desc: desc,
        price: price,
        phone: phone,
        date: date,
        tags: tags
    });

    User.findOne({ email: sess.email }, function (err, foundUser) {

        if (!foundUser) {
            console.log("User not found");
            return res.status(404).send({ message: "User Not found." });
        }
        else {
            foundUser.posts.push(post);
            foundUser.save(function (err, result) {     //Save updates to User database
                if (err) {
                    cosole.log(err);
                }
                else {
                    console.log(result);
                }
            })
        }
    })




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

    //verification code entered by user
    code = req.body.code;
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
            console.log("user found");

            console.log(foundUser.status)
            //Activate account
            foundUser.status = "Active";
            console.log("CHanged user status")
            console.log(foundUser.status)

            //Save updates to User database
            foundUser.save(function (err, result) {
                if (err) {
                    cosole.log(err);
                }
                else {
                    console.log(result);
                }
            });

            //Renders login page so new user can sign in
            res.render("login")

        }

    })

})


//Functionality for the Account Creation Page
app.post("/signup", function (req, res) {

    //Alerts array
    let alert = [0, 0, 0];

    //Some important constants
    const emailHandle = "@vanderbilt.edu";
    const symbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    const saltRounds = 10

    //Reads user email and password
    useremail = req.body.email
    plainTextUserPassword = req.body.password
    console.log(useremail)
    console.log(plainTextUserPassword)
    console.log(req.body.password2)

    // //Checks if email is already taken
    // User.findOne({ email: useremail }, function (err, foundUser) {
    //     if (err) {
    //         console.error(err);
    //     } else {
    //         if (foundUser != null) {
    //             console.log("Email Already Taken")

    //             alert[1] = 1;
    //             return res.render("signup", { alerts: alert });
    //         } else {
    //             console.log("Email Not Taken")
    //         }
    //     }
    // })

    //Checks valid vanderbilt email handle was entered
    if (!(useremail.endsWith(emailHandle))) {
        console.error("Not a Valid Vanderbilt Email");

        alert[0] = 1;
        return res.render("signup", { alerts: alert });
    }

    //Checks Password meets Certain Strength Requirements
    if (plainTextUserPassword.length < 8 || plainTextUserPassword.length > 25 || !(hasNumber(plainTextUserPassword)) || !(symbols.test(plainTextUserPassword))) {
        console.log("Password does not meet Strength requirements");

        alert[1] = 1;
        return res.render("signup", { alerts: alert });
    }

    //Confirms Password matches Re-Typed Version
    if (plainTextUserPassword != req.body.password2) {
        console.log("Passwords do not match")

        alert[2] = 1;
        return res.render("signup", { alerts: alert });
    }

    //Creates a unique confirmation code for account email verification
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

            //gmail account that will automatically send authentication codes
            user: 'reusevandy@gmail.com',
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

    //User Password gets hashed for security purposes
    bcrypt.hash(plainTextUserPassword, saltRounds, function (err, hash) {
        if (err) {
            console.error(err)
        } else {

            //Creates a new user with specified email and password
            const user = new User({
                email: useremail,
                password: hash,
                confirmationCode: code
            })

            //Saves new user to database
            User.insertMany(user, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("successfully saved user")
                    return res.redirect("/verify");
                }
            });
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

    //Checks User database to ensure email and password are correct
    User.findOne({ email: useremail }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {

            //No user with entered email is found
            if (!foundUser) {
                console.log("User not found");
            }

            //User account still pending (email not verified)
            if (foundUser.status == 'Pending') {
                console.log("Account Still Pending")
                //res.redirect("/verify");
            }

            //Check Password
            console.log("Testing Password Validation")
            console.log(userpassword)
            console.log(foundUser.password)
            bcrypt.compare(userpassword, foundUser.password, function (err, result) {
                if (err) {
                    console.error(err)
                } else {
                    console.log("REverse hashing success!")
                    if (result) {
                        console.log("user found");

                        //Renders Home Page after successful login
                        res.redirect("/home")
                    } else {
                        console.log("Invalid Password")
                    }
                }
            })
        }
    })

})

/**********Helper Functions**********/

//For Testing Password Contains a Number
function hasNumber(myString) {
    return /\d/.test(myString);
}

//For ordering item posts by date
function sortByDate(property) {
    return function (a, b) {
        if ((a[property] - b[property]) < 0)
            return 1;
        else if ((a[property] - b[property]) > 0)
            return -1;

        return 0;
    }
}


//Local Port for development
app.listen(3000, function () {
    console.log("App is listening on port 3000");
})