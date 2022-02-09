const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/",function(req,res){
    res.render("home/index");
});

app.get("/edit",function(req,res){
    res.render("content/content");
});
app.listen("3000",function(){
    console.log("Server started at port 3000");
});