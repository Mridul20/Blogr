const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const og = require('open-graph');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/",function(req,res){
    res.render("home");
});

app.get("/edit",function(req,res){
    res.render("content");
});

app.get("/fetchUrl",function(req,res){
    const {method, url} = req;
   
    const link = decodeURIComponent(url.slice('/fetchUrl?url='.length));

    og(link, function(err, meta) {
        const newmeta = {
            title : meta.title,
            description : meta.description,
            image : {
                url : meta.image.url
            }
        }
        meta = newmeta;
        const jsonData = JSON.stringify({
            success: 1,
            link : link,
            meta
          });

        res.send(jsonData);
    });
});

app.post("/save",function(req,res){
    console.log(req.body);
    res.send({"t":"e"});
});
app.get("/search",function(req,res){
    res.render("search");
})
app.get("/login",function(req,res){
    res.render("login");
})
app.listen("3000",function(){
    console.log("Server started at port 3000");
});



