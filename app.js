const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose")

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
    posts: {type: [postSchema]}
});



const User = mongoose.model("User", userSchema);


app.use(bodyParser.urlencoded({extended:true}))

app.get("/", function(req, res){
    res.render("signup");
})

app.get("/verify", function(req, res){
    res.render("verify");
})

app.get("/home", function(req, res){
    res.render("home");
})

app.post("/verify", function(req, res){
    res.redirect("home")
})

app.post("/", function(req, res){
    useremail = req.body.email
    userpassword = req.body.password

    const user = new User({
        email: useremail,
        password: userpassword
    })
    User.insertMany(user, function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("successfully saved user")
            res.redirect("/verify")
        }
    });


})


app.listen(3000, function(){
    console.log("App is listening on port 3000");
})