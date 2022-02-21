import fetch from "node-fetch";

fetch('http://127.0.0.1:3000/save', {
  method: 'post',
  body: JSON.stringify({"user":{
      "email": "abx",
      "password": "pwd"
  }}),
});

import fetch from 'node-fetch';

const body = {a: 1};

const response = await fetch('http://localhost:3000/save', {
	method: 'POST',
    mode : "cors",
	body: JSON.stringify(body),

	headers: {'Content-Type': 'application/json'}
});
const data = await response.json();

console.log(data);



import fetch from 'node-fetch';

const response = await fetch('http://localhost:3000/save', {method: 'POST', body: 'a=1'});
const data = await response.json();

console.log(data);

var yourUrl = "http://localhost:3000/save";
import XMLHttpRequest from 'xhr2';
var xhr = new XMLHttpRequest();
xhr.open("POST", yourUrl, true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({
    "dw": "dwadad"
}));

fetch('http://localhost:3000/save', {
    method: 'POST',
    // body: JSON.stringify({
    //     title: document.getElementById("title").value,
    //     blog_body: JSON.stringify(output),
    //     // id: "{{id}}",
    //     // tags: $("#blog-tags").val()
    // }),
    body :{title : "hello" , body : "mridul"}  ,
    headers: {'Content-Type': 'application/json'}
})