const editor = new EditorJS({
    tools: {
        header: Header,
        raw: RawTool,
        image: SimpleImage, 
        // linkTool: {
        //     class: LinkTool,
        //     config: {
        //       endpoint: 'http://localhost:3000/fetchUrl', // Your backend endpoint for url data fetching,
        //     }
        //   },
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          embed: Embed,
          quote: Quote,
    }
  });


  function savedata() {
    console.log("BRSF DAd");
    editor
        .save()
        .then((output) => {
          console.log("output");
            console.log(output);
            console.log(document.getElementById("title").value);
            if (!document.getElementById("title").value) {
                alert("Enter Blog Title");
                return; 
            }

            fetch('http://localhost:3000/save', {
                method: 'POST',
                mode: 'cors', // this cannot be 'no-cors'
                // body: JSON.stringify({
                //     title: document.getElementById("title").value,
                //     blog_body: JSON.stringify(output),
                //     // id: "{{id}}",
                //     // tags: $("#blog-tags").val()
                // }),
                body :{title : "hello" , body : "mridul"}  ,
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
            })
                // .then((response) => {
                //     let notificationDiv = $(".notification-container .notification-s");
                //     if (response.status == 200) {
                //         notificationDiv.css("display", "block").css("background", "#5cb85c").html("Post Saved").fadeOut(5000);
                //     } else {
                //         notificationDiv.css("display", "block").css("background", "#d9534f").html("Error Occured").fadeOut(5000);
                //     }
                // })
        })
        .catch((error) => {
            console.log(error);
        });
}