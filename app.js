const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const url = require("url");
const fs = require("fs");
const { spawn } = require("child_process");
const session = require("express-session");
const passport = require("passport");
const passporLocalMongoose = require("passport-local-mongoose");
const { response } = require("express");
const nodemailer = require('nodemailer');

const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  session({
    secret: "Mridul Mittal",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  "mongodb+srv://admin:admin@cluster0.qyck5.mongodb.net/blogrDB"
);

const blogSchema = {
  key: String,
  title: String,
  body: String,
  tag: Array,
  author: String,
  draft: Boolean,
  covimg : String,

};

const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  blogs: Array,
  favourite : Array,
});

userSchema.plugin(passporLocalMongoose);

const Blog = mongoose.model("Blog", blogSchema);
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/test",function(req,res){
    res.render("test",{value : 4});
});

app.get("/python", (req, res) => {
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn("python", ["python/script.py", key]);
  // collect data from script
  python.stdout.on("data", function (data) {
    console.log("Pipe data from python script ...");
    dataToSend = data.toString();
  });
  // in close event we are sure that stream from child process is closed
  python.on("close", (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    console.log(dataToSend);
    res.send(dataToSend);
  });
});

app.get("/profile/:username", function (req, res) {
  console.log(req.params);
  User.find({ username: req.params.username }, function (err, result) {
    Blog.find({ author: req.params.username }, function (error, output) {
      Blog.find({key:result[0].favourite},function(erro,ans){
        const data = {
          blog: output,
          name: result[0].fullname,
          username: result[0].username,
          noofblog : result[0].blogs.length,
          totblog: result[0].blogs,
          favblog: ans
        };  
        return res.render("profile", data);
      })
    });
  });
});

app.get("/", function (req, res) {
  if (req.isAuthenticated())
    res.render("home", { login: true, username: req.user.username, message: req.query.message  });
  else res.render("home", { login: false, message: req.query.message  });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/draft/:author/:key", function (req, res) {
  Blog.find({ key: req.params.key }, function (err, result) {
    console.log(result);
    if (result.length == 0)
      return res.render("draft", {
        author: req.params.author,
        key: req.params.key,
        data: null,
        title: null,
        covimg : "",
      });
    else
      return res.render("draft", {
        author: req.params.author,
        key: req.params.key,
        data: result[0].body,
        title: result[0].title,
        covimg : result[0].covimg,
      });
  });
});

app.get("/edit", function (req, res) {
  const author = req.user.username;
  User.find({ username: author }, function (err, result) {
    const key = author + (result[0].blogs.length + 1);
    return res.redirect("/draft/" + author + "/" + key);
  });
});

app.get("/genaudio/:author/:key", function (req, res) {
  var dataToSend;
  const python = spawn("python", [
    "python/txttoaudio.py",
    req.params.key,
    req.params.author,
  ]);
  python.stdout.on("data", function (data) {
    console.log("Pipe data from python script ...");
    dataToSend = data.toString();
  });
  python.on("close", (code) => {
    console.log(`child process close all stdio with code ${code}`);
    console.log(dataToSend);
    res.send(dataToSend);
  });
});

app.get("/gentext/:key", function (req, res) {
  Blog.find({ key: req.params.key }, function (err, result) {
    if (err) console.log(err);
    if (result.length == 0) res.send("No blog exists");
    var txtdata = "Title .................. ";
    const newpar = ".........................................";
    txtdata =
      txtdata +
      result[0].title +
      newpar +
      "written by .................." +
      result[0].author +
      newpar;
    const jsonbody = JSON.parse(result[0].body);
    for (var i = 0; i < jsonbody.blocks.length; i++)
      txtdata = txtdata + jsonbody.blocks[i].data.text + newpar;
    // console.log(txtdata);
    if (!fs.existsSync("bloggers")) fs.mkdirSync("bloggers");
    const path = "bloggers/" + result[0].author;
    if (!fs.existsSync(path)) fs.mkdirSync(path);
    fs.writeFile(path + "/" + req.params.key + ".txt", txtdata, function (err) {
      if (err) return console.log(err);
    });
    return res.redirect("/genaudio/" + result[0].author + "/" + req.params.key);
  });
});

app.post("/saveblogdata", function (req, res) {
  Blog.find({ key: req.body.key }, function (err, result) {
    if (err) console.log(err);
    if (result.length == 0) {
      console.log("hello");
      var newblog = new Blog({
        key: req.body.key,
        title: req.body.title,
        body: String(req.body.blogdata),
        tag: ["1", "2"],
        author: req.body.author,
        draft : req.body.draft,
        covimg : req.body.covimg,
      });
      newblog.save();
      User.updateMany(
        { username: req.body.author },
        { $push: { blogs: req.body.key } },
        function (erro) {
          if (erro) console.log(erro);
        }
      );
    } else {
      Blog.update(
        { key: req.body.key },
        {
          title: req.body.title,
          body: req.body.blogdata,
          tag: ["1", "2"],
          draft : req.body.draft,
          covimg : req.body.covimg,
        },
        function (err) {
          if (err) console.log(err);
        }
      );
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

app.post("/register", function (req, res) {
  console.log(req.body);

  const usr = new User({
    username: req.body.username,
    fullname: req.body.name,
    email: req.body.email,
    blogs: [],
  });

  User.register(usr, req.body.password, function (err, regUser) {
    if (err) {
      console.log(err);
      return res.redirect(
        url.format({
          pathname: "/register",
          query: {
            error: err,
          },
        })
      );
    } else {
      passport.authenticate("local")(req, res, function () {
        req.login(regUser, function (err) {
          if (err) {
            console.log(err);
            return res.redirect(
              url.format({
                pathname: "/register",
                query: {
                  error: err,
                },
              })
            );
          }
          return res.redirect("/");
        });
      });
    }
  });
});

app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

app.get("/search/:query", function (req, res) {
  let query = req.params.query;
  Blog.find(
    { $or: [{ tag: query }, { title: query }] },
    function (err, result) {
      console.log(result);
      res.render("search", { result: result });
    }
  );
});

app.post("/search", function (req, res) {
  var query = req.body.search;
  return res.redirect("/search/" + query);
});
app.post("/contact", function (req, res) {
  const data = req.body
  // console.log("dakda")
  // console.log(data);
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'spotr.iiita@gmail.com',
      pass: 'spotr@1234'
    }
  });

  var mailOptions = {
    from: `spotr.iiita@gmail.com`,
    to: 'spotr.iiita@gmail.com',
    subject: `${data.subject},blogr query`,
    text: `
      ${data.message} .
      Name :${data.name}
      Email Id: ${data.email}`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.redirect(url.format({
        pathname: "/",
        query: {
          message: "Email not Sent"
        }
      }));
    }
    else {
      return res.redirect(url.format({
        pathname: "/",
        query: {
          message: "Email sent successfully"
        }
      }));
    }
  });
})
app.listen("3000", function () {
  console.log("Server started at port 3000");
});
