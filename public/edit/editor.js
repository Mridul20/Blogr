const editor = new EditorJS({
    placeholder: 'Let`s write an awesome story!',
    tools: {
        header: Header,
        raw: RawTool,
        image: SimpleImage, 
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
    },
    // autofocus: true
    // readOnly: true
  });


  function savedata() {
    editor
        .save()
        .then((output) => {
            if (!document.getElementById("title").value) {
                alert("Enter Blog Title");
                return; 
            }
            fetch('/saveblogdata',{
                method: 'POST',
                headers: {
                  'Content-Type':'application/json'
                },
                body: JSON.stringify({
                  title: document.getElementById("title").value,
                  blogdata: JSON.stringify(output),
                  // id: "{{id}}",
                  // tags: $("#blog-tags").val()
              }),
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