const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const { use } = require("express/lib/application");
const url = require('url');
const { spawn } = require("child_process");

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin:admin@cluster0.yavmq.mongodb.net/blogDB");


app.get('/python', (req, res) => {

  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn('python', ['python/script.py']);
  // collect data from script
  python.stdout.on('data', function (data) {
    console.log('Pipe data from python script ...');
    dataToSend = data.toString();
  });
  // in close event we are sure that stream from child process is closed
  python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    console.log(dataToSend);
    res.send(dataToSend)
  });

})

const blogSchema = {
  id: String,
  title: String,
  body: String,
  tag: Array,
};

const userSchema = {
  username: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}
const Blog = mongoose.model("Blog", blogSchema);
const User = mongoose.model("User", userSchema);



const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};
const salt = bcrypt.genSaltSync(10);

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



app.post("/register",function(req,res){
  console.log(req.body);
  var username = req.body.username;
  var fullname = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  var password1 = req.body.password1;
  var passwordhash = bcrypt.hashSync(password, salt);

  if(password != password1)
    return res.redirect(url.format({
      pathname:"/register",
      query: {
        "error": "Passwords do not match",
      }
    }));

  if(!validateEmail(email))
  return res.redirect(url.format({
      pathname:"/register",
      query: {
        "error": "Invalid Email",
      }
    }));

  User.find({username : username},function(err,result){
      if(result.length > 0)
      return res.redirect(url.format({
          pathname:"/register",
          query: {
            "error": "Username Exists",
          }
        }));      
  });

  User.find({email : email},function(err,result){
    if(result.length > 0)
    return res.redirect(url.format({
        pathname:"/register",
        query: {
          "error": "Email Exists",
        }
      }));      
});
  var newUser = new User({
    username : username,
    fullname : fullname,
    email : email,
    password : passwordhash
  });
  newUser.save();

  return res.redirect(url.format({
    pathname:"/login",
    query: {
      // "login": true,
      "username" : username   
    }
  }));   
});

app.post("/login", function (req, res) {
  console.log(req.body);
  var username = req.body.username;
  var password = req.body.password;


  User.find({ username: username }, function (err, result) {


    if (result.length == 0)
      return res.redirect(url.format({
        pathname: "/login",
        query: {
          "err": "Invalid Username",
        }
      }));
    if (!bcrypt.compareSync(password, result[0].password))
      return res.redirect(url.format({
        pathname: "/login",
        query: {
          "err": "Invalid Password",
        }
      }));
    console.log("hello");
    return res.redirect(url.format({
      pathname: "/",
      query: {
        "login": true,
        "username": username
      }
    }));
  });
});
app.get("/search", function (req, res) {
  let tagquery = req.query.username;
  // console.log(tagquery);
  Blog.find({ $or: [{ tag: tagquery }, { title: tagquery }] }, function (err, result) {
    console.log(result);

    res.render("search", { result });
  })
})
app.post("/search", function (req, res) {
  var tagquery = req.body.search;
  // Blog.find({ $or: [{ tag: tagquery }, { title: tagquery }] }, function (err, result) {
  //   console.log(result);
  // var newUser = new User({
  //   id: result.id,
  //   title: result.title
  // });
  // console.log(newUser);


  return res.redirect(url.format({
    pathname: "/search",
    query: {
      // "login": true,
      "username": tagquery
    }
  }));
});

app.listen("3000", function () {
  console.log("Server started at port 3000");
});