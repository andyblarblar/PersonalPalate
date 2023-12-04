const mealsList = document.getElementById("mealsList");
const closeModal = document.getElementById("close");
const modal = document.getElementById("modal");
const home = document.getElementById("home");
const mealEditForm = document.getElementById("mealEditForm");

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.onclick = function(event) {
  if (event.target === modal) modal.style.display = "none";
}

home.addEventListener("click", () => {
    window.location = "/";
});

mealEditForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const mealName = document.getElementById("mealName");
    const category = document.getElementById("categories");
    const dateMade = document.getElementById("dateMade");
    const userEmail = document.getElementById("userEmail");
    const mealID = document.getElementById("mealID");

    const data = {
        mealName: mealName.value,
        category: category.value,
        dateMade: dateMade.value,
        mealID: mealID.innerText,
        email: userEmail.innerText
    }

    console.log(data);

    fetch("/meal", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then((response) => {
        if (response.ok) {
            alert("Updated meal successfully!");
        } else {
            response.text().then((error) => {
               console.error("Failed to update meal with error:", error);
            });
        }
    });
    populateMeals();
    modal.style.display = "none";
});

async function populateMeals() {
    const response = await fetch("/meal/followed");

    const data = await response.json();

    if (response.ok) {
        if (mealsList.childElementCount > 0) {
            while (mealsList.firstChild)
                mealsList.removeChild(mealsList.lastChild);
        }
        data.forEach((meal) => {
            let mealEntry = document.createElement("div");
            mealEntry.innerText = meal.mealName;
            mealEntry.id = meal.mealID;
            mealEntry.classList.add("meal-entry");

            let editIcon = document.createElement("i");
            editIcon.classList.add("fa-solid", "fa-pen-to-square");
            editIcon.style.alignSelf = "center";
            editIcon.style.cursor = "pointer";

            editIcon.addEventListener("click", () => {
                openModal(meal);
            });

            let trashIcon = document.createElement("i");
            trashIcon.classList.add("fa-solid", "fa-trash");
            trashIcon.style.alignSelf = "center";
            trashIcon.style.cursor = "pointer";

            trashIcon.addEventListener("click", () => {
                const confirmed = confirm("Are you sure you want to delete this meal?");
                if (!confirmed) return;
                fetch("/meal", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(meal)
                }).then((deleteResponse) => {
                    if (deleteResponse.ok) {
                        alert("Successfully deleted!");
                    } else {
                        deleteResponse.text().then((error) => {
                            alert(`Failed to delete meal. Error: ${error}`)
                        });
                    }
                });
                populateMeals();
            });

            mealEntry.appendChild(editIcon);
            mealEntry.appendChild(trashIcon);
            mealsList.appendChild(mealEntry);
        });
    } else {
        console.error(`Failed to get followed meals with error: ${await response.text()}`);
    }
}

async function openModal(meal) {
    modal.style.display = "block";

    const mealName = document.getElementById("mealName");
    const category = document.getElementById("categories");
    const dateMade = document.getElementById("dateMade");
    const userEmail = document.getElementById("userEmail");
    const mealID = document.getElementById("mealID");

    mealName.placeholder = meal.mealName;
    category.value = meal.category;
    dateMade.value = meal.dateMade;
    userEmail.innerText = meal.email;
    mealID.innerText = meal.mealID;
}

populateMeals();