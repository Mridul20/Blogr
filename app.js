const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const og = require('open-graph');
var restify = require('restify');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(restify.plugins.bodyParser());

mongoose.connect("mongodb+srv://admin:admin@cluster0.qyck5.mongodb.net/blogDB");

const blogSchema = {
    id : String,
    title : String,
    body : String,
    tag : Array,
};

const Blog = mongoose.model("Blog", blogSchema);


app.get("/",function(req,res){
    res.render("home");
});

app.get("/edit",function(req,res){
    res.render("content");
});


app.post("/save",function(req,res){

    console.log(req.body.blogdata);
    var newblog = new Blog({
        id : "1234",
        title : req.body.title,
        body : String(req.body.blogdata),
        tag : ["1","2"]
    });
    newblog.save();
    res.send({"t":"e"});
});
app.get("/search",function(req,res){
    res.render("search");
})
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/register",function(req,res){
    res.render("register");
})
app.listen("3000",function(){
    console.log("Server started at port 3000");
});



// app.get("/fetchUrl",function(req,res){
//     const {method, url} = req;
   
//     const link = decodeURIComponent(url.slice('/fetchUrl?url='.length));

//     og(link, function(err, meta) {
//         console.log("meta");
//         console.log(meta);
//         const newmeta = {
//             title : meta.title,
//             description : meta.description,
//             image : {
//                 url : meta.image.url
//             }
//         }
//         meta = newmeta;
//         const jsonData = JSON.stringify({
//             success: 1,
//             link : link,
//             meta
//           });
//         console.log(jsonData);
//         res.send(jsonData);
//     });
// });


