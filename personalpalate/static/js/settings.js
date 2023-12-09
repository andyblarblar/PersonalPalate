const followList = document.getElementById("followList");
const homeButton = document.getElementById("home");
const followButton = document.getElementById("follow");
const slider = document.getElementById("slider");
const nameButton = document.getElementById("nameButton");
const checkbox = document.getElementById("checkbox");
const name = document.getElementById("name");

homeButton.addEventListener("click", () => {
    window.location = "/"
});

slider.addEventListener("click", () => {
    checkbox.checked = !checkbox.checked;
    fetch("/account/settings", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ followable: checkbox.checked, name: name.placeholder})
    }).then((response) => {
        if (!response.ok) {
            alert("Failed to update followable settings");
        }
    })
});

nameButton.addEventListener("click", () => {
    fetch("/account/settings", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ followable: checkbox.checked, name: name.value})
    }).then((response) => {
        if (!response.ok) {
            alert("Failed to update name");
        } else {
            alert("Successfully updated name!");
        }
        window.location = "/settings";
    })
});

followButton.addEventListener("click", () => {
   const email = document.getElementById("follow-email");

   fetch("/account/follow", {
       method: "POST",
       headers: {
           "Content-Type": "application/json"
       },
       body: JSON.stringify({email: email.value})
   }).then((response) => {
       if (!response.ok) {
           response.text().then((error) => {
               let err_json = JSON.parse(error);
               alert(`Failed to follow user: ${err_json.detail}`);
           });
       } else {
           alert("Successfully followed user.");
           email.value = "";
           populateFollowers();
       }
   })
});

async function populateFollowers() {
    const response = await fetch("/account/follow");

    const data = await response.json();

    if (response.ok) {
        if (followList.childElementCount > 0) {
            while (followList.firstChild)
                followList.removeChild(followList.lastChild);
        }
        data.forEach((followee) => {
            let followEntry = document.createElement("div");
            followEntry.classList.add("follow-entry");
            followEntry.innerText = followee.email;

            let unfollow = document.createElement("p");
            unfollow.style.alignSelf = "center";
            unfollow.innerText = "Unfollow";
            unfollow.style.cursor = "pointer";
            unfollow.style.margin = "0";

            unfollow.addEventListener("click", () => {
               fetch("/account/follow", {
                   method: "DELETE",
                   headers: {
                       "Content-Type": "application/json"
                   },
                   body: JSON.stringify({email: followee.email})
               }).then((response) => {
                  if (response.ok) {
                    alert("Successfully unfollowed user!");
                  } else {
                      response.text().then((error) => {
                         console.error(`Error occurred unfollowing user: ${error}`)
                      });
                  }
                  populateFollowers();
               });
            });

            followEntry.appendChild(unfollow);
            followList.appendChild(followEntry);
        });
    }
}

populateFollowers();