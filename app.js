const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.listen("3000",function(){
    console.log("Server started at port 3000");
});

app.use(express.static("public"));
app.use(express.json({limit:'1mb'}));
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs');


app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
})
app.get("/register",function(req,res){
    res.render("register");
})

app.get("/edit",function(req,res){
    res.render("edit");
});

app.post("/saveblogdata",function(req,res){
    console.log(req.body);
});

app.post("/search",function(req,res){
    console.log(req.body);
})