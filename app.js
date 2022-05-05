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
const nodemailer = require("nodemailer");
const fileUpload = require("express-fileupload");
const { receiveMessageOnPort } = require("worker_threads");
const cloudinary = require("cloudinary").v2;
const gtts = require('gtts')

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
  covimg: String,
  views: Number,
  lastUpdateTime: String,
  txtdata : String,
};

const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  blogs: Array,
  favourite: Array,
  cnt: Number,
  address: String,
  mobile: String,
});

userSchema.plugin(passporLocalMongoose);

const Blog = mongoose.model("Blog", blogSchema);
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

cloudinary.config({
  cloud_name: "dru14xtia",
  api_key: "484365817547376",
  api_secret: "d_qbVAh3Qkm7uAL5rJsajI3g2ag",
  secure: true,
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
      Blog.find({ key: result[0].favourite }, function (erro, ans) {
        console.log("size");
        console.log(output.length);
        const data = {
          blog: output,
          name: result[0].fullname,
          username: result[0].username,
          noofblog: result[0].blogs.length,
          totblog: result[0].blogs,
          address: result[0].address,
          mobile: result[0].mobile,
          email: result[0].email,
          favblog: ans,
        };
        return res.render("profile", data);
      });
    });
  });
});

app.get("/", function (req, res) {
  console.log("np req");
  Blog.find({}, function (err, result) {
    var sendres = result.splice(0, 3);

    // console.log(sendres.length);
    if (req.isAuthenticated())
      return res.render("home", {
        login: true,
        username: req.user.username,
        message: req.query.message,
        topblog: sendres,
      });
    else
      return res.render("home", {
        login: false,
        message: req.query.message,
        topblog: sendres,
      });
  }).sort({ views: -1 });
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
        covimg: "",
        tag : [],
        txtdata : "",
      });
    else
      return res.render("draft", {
        author: req.params.author,
        key: req.params.key,
        data: result[0].body,
        title: result[0].title,
        covimg: result[0].covimg,
        tag : result[0].tag,
        txtdata : result[0].txtdata,
      });
  });
});

app.get("/view/:author/:key", function (req, res) {
  if (req.isAuthenticated()) {
    User.find({ username: req.user.username }, function (err, resu) {
      let bkmark = 0;
      for (var i = 0; i < resu[0].favourite.length; i++)
        if (resu[0].favourite[i] == req.params.key) bkmark = 1;
      Blog.find({ key: req.params.key }, function (err, result) {
        if (result.length == 0)
          return res.render("blogview", {
            author: req.params.author,
            key: req.params.key,
            data: null,
            title: null,
            covimg: "",
            bkmark: 0,
            tag : [],
            txtdata : "",
          });
        else {
          Blog.update(
            { key: req.params.key },
            { $inc: { views: 1 } },
            function (erro) {
              if (erro) console.log(erro);
            }
          );
          console.log(result[0].txtdata);
          return res.render("blogview", {
            author: req.params.author,
            key: req.params.key,
            data: result[0].body,
            title: result[0].title,
            covimg: result[0].covimg,
            tag : result[0].tag,
            bkmark: bkmark,
            txtdata : result[0].txtdata,
          });
        }
      });
    });
  } 
  else {
    Blog.find({ key: req.params.key }, function (err, result) {
      if (result.length == 0)
        return res.render("blogview", {
          author: req.params.author,
          key: req.params.key,
          data: null,
          title: null,
          covimg: "",
          bkmark: 0,
          tag : [],
          txtdata : "",
        });
      else {
        Blog.update(
          { key: req.params.key },
          { $inc: { views: 1 } },
          function (erro) {
            if (erro) console.log(erro);
          }
        );
        return res.render("blogview", {
          author: req.params.author,
          key: req.params.key,
          data: result[0].body,
          title: result[0].title,
          covimg: result[0].covimg,
          tag : result[0].tag,
          bkmark: 0,
          txtdata : result[0].txtdata,
        });
      }
    });
  }
});

app.post("/bookmark", function (req, res) {
  console.log("post req");
  if (req.isAuthenticated()) {
    var usern = req.user.username;
    User.findOneAndUpdate(
      { username: usern, favourite: { $in: [req.body.key] } },
      { $pull: { favourite: req.body.key } },
      function (err, suc) {
        if (!suc) {
          User.findOneAndUpdate(
            { username: usern },
            { $push: { favourite: req.body.key } },
            function (error, success) {
              if (error) {
                console.log(error);
              } else {
                console.log(success);
              }
            }
          );
        }
      }
    );
  }
});

app.get("/unbookmark/:key", function (req, res) {
  var usern = req.user.username;
  User.findOneAndUpdate(
    { username: usern },
    { $pull: { favourite: req.params.key } },
    function (err, suc) {
      if (err) console.log(err);
      else res.redirect("/profile/" + usern);
    }
  );
});

app.get("/delete/:author/:key", function (req, res) {
  Blog.deleteOne({ key: req.params.key }, function (err) {
    if (err) console.log(err);
  });
  User.update(
    { username: req.params.author },
    { $pull: { blogs: req.params.key } },
    function (err) {
      if (err) console.log(err);
    }
  );

  res.redirect("/profile/" + req.params.author);
});
app.get("/edit", function (req, res) {
  const author = req.user.username;
  User.find({ username: author }, function (err, result) {
    var key = author + result[0].cnt;
    return res.redirect("/draft/" + author + "/" + key);
  });
});

app.get("/display/:author/:key", function (req, res) {
  Blog.find({ key: req.params.key }, function (err, result) {
    console.log(result);
    if (result.length == 0)
      return res.render("display", {
        author: req.params.author,
        key: req.params.key,
        data: null,
        title: null,
        covimg: "",
      });
    else
      return res.render("display", {
        author: req.params.author,
        key: req.params.key,
        data: result[0].body,
        title: result[0].title,
        covimg: result[0].covimg,
      });
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




app.get('/tts',(req,res) => {
  res.render('tts');
})
 
// app.post('/tts',(req,res) => {
//   var text = req.body.text
 
//   var language = req.body.language
 
//   outputFilePath = Date.now() + "output.mp3"
 
//   var voice = new gtts(text,language)
 
//   voice.save(outputFilePath,function(err,result){
//     if(err){
//       fs.unlinkSync(outputFilePath)
//       res.send("Unable to convert to audio")
//     }
//     res.download(outputFilePath,(err) => {
//       if(err){
//         fs.unlinkSync(outputFilePath)
//         res.send("Unable to download the file")
//       }
 
//       fs.unlinkSync(outputFilePath)
//     })
//   })
// })





app.post("/saveblogdata", function (req, res) {
  const monthNames = [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec.",
  ];
  const ts = Date.now();
  const date_ob = new Date(ts);
  const date = date_ob.getDate();
  const month = date_ob.getMonth() + 1;
  const year = date_ob.getFullYear();

  const time = monthNames[month - 1] + " " + date + "," + year;

  var txtdata = "Title .................. ";
  const newpar = ".........................................";
  txtdata =  txtdata +  req.body.title +  newpar + "written by .................." +  req.body.author +  newpar;
  const jsonbody = JSON.parse(req.body.blogdata);
  for (var i = 0; i < jsonbody.blocks.length; i++)
    txtdata = txtdata + jsonbody.blocks[i].data.text + newpar;

  console.log(txtdata);

  Blog.find({ key: req.body.key }, function (err, result) {
    if (err) console.log(err);
    if (result.length == 0) {
      const imgFile = req.body.covimg;
      cloudinary.uploader.upload(imgFile, function (err, resu) {
        var newblog = new Blog({
          key: req.body.key,
          title: req.body.title,
          body: String(req.body.blogdata),
          author: req.body.author,
          draft: req.body.draft,
          covimg: resu.url,
          lastUpdateTime: time,
          views: 0,
          tag : req.body.tag,
          txtdata : txtdata,
        });
        newblog.save();
        User.updateMany(
          { username: req.body.author },
          { $push: { blogs: req.body.key }, $inc: { cnt: 1 } },
          function (erro) {
            if (erro) console.log(erro);
          }
        );
      });
    } 
    else {
      const imgFile = req.body.covimg;
      cloudinary.uploader.upload(imgFile, function (err, resu) {
        Blog.update(
          { key: req.body.key },
          {
            title: req.body.title,
            body: req.body.blogdata,
            draft: req.body.draft,
            covimg: resu.url,
            lastUpdateTime: time,
            tag : req.body.tag,
            txtdata : txtdata,
          },
          function (err) {
            if (err) console.log(err);
          }
        );
      });
    }
  });
});

app.post("/register", function (req, res) {
  console.log(req.body);

  const usr = new User({
    username: req.body.username,
    fullname: req.body.name,
    email: req.body.email,
    blogs: [],
    cnt: 0,
    mobile: "+91",
    address: "Home",
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
    { $or: [{ tag: query }, { title: query }, { author: query }] },
    function (err, result) {
      console.log(result);
      if (req.isAuthenticated())
        return res.render("search", {
          login: true,
          username: req.user.username,
          result: result,
        });
      else
        return res.render("search", {
          login: false,
          message: req.query.message,
          result: result,
        });
    }
  ).sort({ views: -1 });
});

app.post("/search", function (req, res) {
  var query = req.body.search;
  return res.redirect("/search/" + query);
});
app.post("/contact", function (req, res) {
  const data = req.body;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "spotr.iiita@gmail.com",
      pass: "spotr@1234",
    },
  });

  var mailOptions = {
    from: `spotr.iiita@gmail.com`,
    to: "spotr.iiita@gmail.com",
    subject: `${data.subject},blogr query`,
    text: `
      ${data.message} .
      Name :${data.name}
      Email Id: ${data.email}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.redirect(
        url.format({
          pathname: "/",
          query: {
            message: "Email not Sent",
          },
        })
      );
    } else {
      return res.redirect(
        url.format({
          pathname: "/",
          query: {
            message: "Email sent successfully",
          },
        })
      );
    }
  });
});

app.post("/updateprofile", function (req, res) {
  const username = req.user.username;
  User.find({ username: username }, function (err, result) {
    console.log(result);
    console.log(req.body);
    var email;
    if (req.body.email == "") email = result[0].email;
    else email = req.body.email;
    var address;
    if (req.body.address == "") address = result[0].address;
    else address = req.body.address;
    var mobile;
    if (req.body.mobile == "") mobile = result[0].mobile;
    else mobile = req.body.mobile;
    var fullname;
    if (req.body.fullname == "") fullname = result[0].fullname;
    else fullname = req.body.fullname;
    User.update(
      { username, username },
      { fullname: fullname, mobile: mobile, address: address, email: email },
      function (erro) {
        if (erro) console.log(erro);
        res.redirect("/profile/" + username);
      }
    );
  });
});

app.get("/xyz", function (req, res) {
  console.log("hnp req");
});
app.listen("3000", function () {
  console.log("Server started at port 3000");
});
