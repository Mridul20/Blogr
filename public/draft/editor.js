

//   function savedraft() {
//     editor
//       .save()
//       .then((output) => {

//       })
//       .catch((error) => {
//         console.log(error);
//     });
// }
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