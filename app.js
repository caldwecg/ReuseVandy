const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const mongoose = require("mongoose")

const app = express();
mongoose.connect('mongodb://localhost:27017/usersDB')

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = mongoose.model("User", userSchema);



app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))

app.get("/", function(req, res){
    res.sendFile(__dirname + "/signup.html");
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
            res.render("success")
        }
    });


})

app.listen(3000, function(){
    console.log("App is listening on port 3000");
})