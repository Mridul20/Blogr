const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");

app.listen("3000", function () {
  console.log("Server started at port 3000");
});

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

const Blog = mongoose.model("Blog", blogSchema);

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
