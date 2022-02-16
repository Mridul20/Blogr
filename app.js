const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const { use } = require("express/lib/application");

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin:admin@cluster0.qyck5.mongodb.net/blogDB");

const blogSchema = {
  id: String,
  title: String,
  body: String,
  tag: Array,
};

const userSchema = {
  username : {
    type : String,
    required : true,
  },
  firstName : {
    type : String,
    required : true,
  },
  lastName : {
    type : String,
    required : true,
  },
  email : {
    type : String,
    required : true,
  },
  password : {
    type : String,
    required : true,
  },
}
const Blog = mongoose.model("Blog", blogSchema);
const User = mongoose.model("User",userSchema);



const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};


app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/edit", function (req, res) {
  res.render("edit");
});

app.post("/saveblogdata", function (req, res) {
  console.log(req.body);
  console.log(req.body.blogdata);
  var newblog = new Blog({
    id: "1234",
    title: req.body.title,
    body: String(req.body.blogdata),
    tag: ["1", "2"],
  });
  newblog.save();
});

app.post("/search", function (req, res) {
  console.log(req.body);
});

app.post("/register",function(req,res){
  console.log(req.body);
  var username = req.body.username;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var password = req.body.password;
  var password1 = req.body.password1;

  if(password != password1)
    res.send("Password do not match");
  if(!validateEmail(email))
    res.send("Invalid Mail");
  User.find({username : username},function(err,result){
      console.log(result);
  });
  var newUser = new User({
    username : username,
    firstName : firstname,
    lastName : lastname,
    email : email,
    password : password
  });
  newUser.save();
  res.redirect("/");
});
app.listen("3000", function () {
  console.log("Server started at port 3000");
});