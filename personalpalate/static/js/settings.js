const followList = document.getElementById("followList");


async function populateFollowers() {
    // Once endpoint for getting followee is available, need to do the below statements for each followee
    let followEntry = document.createElement("div");
    followEntry.classList.add("follow-entry");
    followEntry.innerText = "bcsotty@umich.edu"; // Replace email with email from response

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
           body: JSON.stringify({email: "bcsotty@umich.edu"})
       }).then((response) => {
          if (response.ok) {
            alert("Successfully unfollowed user!");
          } else {
              response.text().then((error) => {
                 console.error(`Error occurred unfollowing user: ${error}`)
              });
          }
       });
    });

    followEntry.appendChild(unfollow);
    followList.appendChild(followEntry);
}

populateFollowers();