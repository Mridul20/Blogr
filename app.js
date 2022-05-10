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
  comments : Array,
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

const allTagList = ["Advertising" , "Advice","America","Amor","Android","Animals","Apple","Architecture","Art", "Artificial intelligence","Astronomy","Beauty","Bitcoin","BlackLivesMatter Blockchain","Blogger","Blogging","Book review","Books","Branding","Brazil","Business","Business Strategy","Careers","Christianity","Climate Change","College","Comedy","Comics","Content Marketing","Cooking","Creativity","Cryptocurrency","Culture","Data science","Dating","Death","Depression","Design","Diversity","Donald Trump","Ecommerce","Economics","Edtech","Education","Education Reform","Elections","Employment","Energy","Entrepreneurship","Environment","Equality","Erotica","Facts","Faith","Fashion","Feminism","Fiction","Finance","Fitness","Food",  "Funny","Future","Gaming","Gender","God","Growth hacking","Happiness","Health","Healthcare","Hillary Clinton","History","Humor","Ideas","IFTTT","Income","India","Innovation","Inspiration","Instagram","Internet of Things","Investing","Islam","Java","Java script","Journalism","Law","Leadership","Learning","LGBTQ","Life","Life Lessons","Literature","Management","Marketing","Marriage","Media","Medium Brazil","Men","Mental Health","Metoo","Mindfulness","Mobile","Mobile App Development","Mobile apps","Money","Motivation","Music","News","Nutrition","Parenting","Personal","Personal Development","Personal growth","Personal stories","Philosophy","Photography","Photos","Physics","Podcast","Poesia","Politics","Pop culture","PPC Marketing","Privacy","Product Management","Productivity","Programming","Property","Prototyping","Psychology","Racism","Reading","Real estate","Relationships","Research","Review","Running","Russia","Russian",
"Sales","Satire","Schools","Science","Science fiction","Security","Self","Self Driving Cars","Self Help","Self-awareness","SEO","Sex","Sexism","Sexuality","Short Story","Small Business","Social Media","Social Media Marketing","Space","Spanish","Spirituality","Sports","Startup","Success","Sustainability","Teaching","Tech","Technology","Television","This Happened To Me","Transportation","Travel","Trump","Twitter","USA","User","Experience","UX","Venture Capital","Vida","Video","Virtual Reality","Web","Web Design","Web development","Weight Loss","Wildlife","Women","Women In Tech","WordPress","Work","World"];


app.get("/profile/:username", function (req, res) {
  User.find({ username: req.params.username }, function (err, result) {
    Blog.find({ author: req.params.username }, function (error, output) {
      Blog.find({ key: result[0].favourite }, function (erro, ans) {
        Blog.find({ author: req.params.username }, function (eror, outp) {
        let cntreads = 0;
        for(let i=0;i<outp.length;i++)
        {
          cntreads = cntreads + outp[i].views;
        }
        const data = {
          blog: output,
          cntreads : cntreads,
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
});

app.get("/", function (req, res) {
  Blog.find({}, function (err, result) {
    var sendres = result.splice(0, 3);
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
    if (result.length == 0)
      return res.render("draft", {
        author: req.params.author,
        key: req.params.key,
        data: null,
        title: null,
        covimg: "",
        tag : [],
        txtdata : "",
        alltag : allTagList,
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
        alltag : allTagList,
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
            comments : [],
            login : true,
            loggedinuser : req.user.username, 
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
            bkmark: bkmark,
            txtdata : result[0].txtdata,
            comments : result[0].comments,
            login : true,
            loggedinuser : req.user.username, 
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
          login : false,
          comments : [],
          loggedinuser : "null", 
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
          login : false,
          txtdata : result[0].txtdata,
          comments : result[0].comments,
          loggedinuser : "null", 
        });
      }
    });
  }
});

app.post("/bookmark", function (req, res) {
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
  else
  {
    res.redirect("/login");
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


app.post("/postcomment/:author/:key",function(req,res){
  if(req.isAuthenticated())
  {
    var comment = req.body.comment;
    var usr = req.user.username;
    var monthNames = [
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
    var ts = Date.now();
    var date_ob = new Date(ts);
    var date = date_ob.getDate();
    var month = date_ob.getMonth() + 1;
    var year = date_ob.getFullYear();
  
    var time = monthNames[month - 1] + " " + date + "," + year;
    newcomment = {text : comment , author : usr , time : time};
    Blog.findOneAndUpdate({key:req.params.key},{$push : {comments : newcomment}},function(err,suc){
      if(err)
        console.log(err);
    });
    res.redirect("/view/" + req.params.author + "/" + req.params.key);
  }
  else
    res.redirect("/login");

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
  const regex =  new RegExp(query,'g');
  Blog.find({ $or: [{ tag: { $regex: query, $options: 'i' }}, { title: { $regex: query, $options: 'i' } }, { author: { $regex: query, $options: 'i' } }] },
    function (err, result) {
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


app.listen(process.env.PORT || 3000, function(){
  console.log("Server started at port 3000");
});