const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const url = require('url');
const fs = require('fs');
const { spawn } = require("child_process");
const session = require("express-session");
const passport = require("passport");
const passporLocalMongoose = require("passport-local-mongoose");
const { response } = require("express");


const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(session({
  secret : "Mridul Mittal",
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session()); 

mongoose.connect("mongodb+srv://admin:admin@cluster0.qyck5.mongodb.net/blogrDB");

const blogSchema = {
  key: String,
  title: String,
  body: String,
  tag: Array,
  author : String,
  privacy : Boolean,
};

const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  blogs : Array,
});

userSchema.plugin(passporLocalMongoose);
  
const Blog = mongoose.model("Blog", blogSchema);
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/python', (req, res) => {

  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn('python', ['python/script.py',key]);
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

app.get('/profile/:username', function(req, res){
  console.log(req.params);
  User.find({username : req.params.username},function(err,result){
    Blog.find({author:req.params.username},function(error,output){
      const data = {
        blog: output,
        name: result[0].fullname,
        username: result[0].username,
        totblog: result[0].blogs
      }    
      return res.render("profile", data);
    })


    const data = {
      name: result[0].fullname,
      username: result[0].username,
      totblog: result[0].blogs
    }
    // console.log(result);
    // return res.render("profile", data);
  });
})

app.post("/txt",function(req,res){
  const username = req.user.username;
  const path = "bloggers/" + username; 
  fs.mkdirSync(path);


  fs.writeFile(path + "/" + req.query.id, 'Hello World!', function (err) {
    if (err) 
      return console.log(err);


  });

  return res.redirect("/");
})

app.get("/", function (req, res) {
  if(req.isAuthenticated()) 
    res.render("home",{ login: true,username: req.user.username });
  else 
    res.render("home",{ login: false });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

app.get("/draft/:author/:key",function(req,res){
  Blog.find({key:req.params.key},function(err,result){
    console.log(result);
    if(result.length == 0)
      return res.render("draft",{author : req.params.author,key : req.params.key,data: null,title : null});
    else
     return res.render("draft",{author : req.params.author,key : req.params.key,data : result[0].body,title : result[0].title});
  });
  
});

app.get("/edit", function (req, res) {
  const author = req.user.username;
  User.find({username : author},function(err,result){
    const key = author  + (result[0].blogs.length + 1);
    return res.redirect("/draft/" + author  + "/" + key);
  });
});



app.post("/saveblogdata", function (req, res) {
  console.log(req.body.blogdata);
  Blog.find({key : req.body.key},function(err,result){
      if(err)
        console.log(err);
      if(result.length == 0)
      {
        console.log("hello");
        var newblog = new Blog({
          key: req.body.key,
          title: req.body.title,
          body: String(req.body.blogdata),
          tag: ["1", "2"],
          privacy : false,
          author : req.body.author,
        });
        newblog.save();
        User.updateMany({username : req.body.author},{ $push: { blogs: req.body.key}},function(erro){
            if(erro)
              console.log(erro);
        });
      }
      else
      {
        console.log(req.body.title);
        Blog.update({key :req.body.key},{title: req.body.title,body: req.body.blogdata,tag: ["1", "2"],privacy : false,},function(err){
          if(err)
            console.log(err);
        })
      }
  });
});








// app.post("/saveblogdata", function (req, res) {

// console.log("q");
// Blog.find({key : req.body.key},function(err,result){
//     if(err)
//       console.log(err);
//     if(result.length == 0)
//     {
//       console.log("hello");
//       var newblog = new Blog({
//         key: req.body.key,
//         title: req.body.title,
//         body: String(req.body.blogdata),
//         tag: ["1", "2"],
//         privacy : false,
//         author : req.body.author,
//       });
//       newblog.save();
//       User.updateMany({username : req.body.author},{ $push: { Blogs: req.body.key}},function(erro){
//           if(erro)
//             console.log(erro);
//       });
//     }
//     else
//     {
//       Blog.updateOne({id :req.body.id},{title: req.body.title,body: String(req.body.blogdata),tag: ["1", "2"],privacy : false,},function(err){
//         if(err)
//           console.log(err);
//       })
//     }
// });
// res.send({author :req.body.author ,key: req.body.key});
// });

app.post("/register",function(req,res){
  console.log(req.body);

  const usr = new User({
    username : req.body.username,
    fullname : req.body.name,
    email : req.body.email,
    blogs : [],
  })

  User.register(usr,req.body.password,function(err,regUser){
    if(err) {
      console.log(err);
      return res.redirect(url.format({
        pathname:"/register",
        query: {
          "error": err,
        }
      }));
    }
    else {
      passport.authenticate("local")(req,res,function(){
        req.login(regUser, function(err) {
          if (err) {
            console.log(err);
            return res.redirect(url.format({
              pathname:"/register",
              query: {
                "error": err,
              }
            }))             
          }
          return res.redirect("/"); 
        });
      });
    }
  });  
});

app.post('/login',passport.authenticate('local', { failureRedirect: '/login' }),function(req, res) {
    res.redirect('/');
});

app.get("/search/:query", function (req, res) {
  let query = req.params.query;
  Blog.find({ $or: [{ tag: query }, { title: query }] }, function (err, result) {
    console.log(result);
    res.render("search", {result: result});
  });
});

app.post("/search", function (req, res) {
  var query = req.body.search;
  return res.redirect("/search/" + query)
});

app.listen("3000", function () {
  console.log("Server started at port 3000");
});