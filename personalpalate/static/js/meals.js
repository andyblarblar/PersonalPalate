const mealsList = document.getElementById("mealsList");
const closeEditModal = document.getElementById("close1");
const closeCreateModal = document.getElementById("close2");
const editModal = document.getElementById("edit-modal");
const createModal = document.getElementById("create-modal");
const home = document.getElementById("home");
const mealEditForm = document.getElementById("mealEditForm");
const mealCreateForm = document.getElementById("mealCreateForm");
const addMealButton = document.getElementById("singleMeal");
const uploadMealButton = document.getElementById("upload");
const uploadText = document.getElementById("upload-text");
const uploadForm = document.getElementById("mealUploadForm");


closeEditModal.addEventListener("click", () => {
  editModal.style.display = "none";
});

closeCreateModal.addEventListener("click", () => {
  createModal.style.display = "none";
});

window.onclick = function(event) {
  if (event.target === editModal) editModal.style.display = "none";
  else if (event.target === createModal) createModal.style.display = "none";
}

home.addEventListener("click", () => {
    window.location = "/";
});

addMealButton.addEventListener("click", () => {
    createModal.style.display = "block";
    uploadText.style.display = "none";
    uploadForm.style.display = "none";
    mealCreateForm.style.display = "flex";
});

uploadMealButton.addEventListener("click", () => {
    createModal.style.display = "block";
    uploadText.style.display = "block";
    uploadForm.style.display = "flex";
    mealCreateForm.style.display = "none";
});

uploadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const csvFile = document.getElementById("csv-input").files[0];

    // TODO POST csvFile to meals endpoint once backend is updated to handle it.
});

mealCreateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const mealName = document.getElementById("createMealName");
    const category = document.getElementById("createCategories");
    const dateMade = document.getElementById("createDateMade");

    const data = [{
        mealName: mealName.value,
        category: category.value,
        dateMade: dateMade.value
    }]

    if (mealName && dateMade && category) {
        fetch("/meal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.ok) {
                populateMeals();
                alert("Successfully added meal!");
                createModal.style.display = "none";
            } else {
                response.text().then((error) => {
                    console.error("Failed to save meal with error", error)
                });
            }
        });
    }
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
    editModal.style.display = "none";
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

            const userEmail = document.getElementById("accountEmail");

            if (meal.email === userEmail.innerText) {
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
            }
            else {
                const author = document.createElement("div");
                author.style.alignSelf = "center";
                author.style.fontSize = "16px";
                author.innerText = meal.email;

                mealEntry.appendChild(author);
            }
            mealsList.appendChild(mealEntry);
        });
    } else {
        console.error(`Failed to get followed meals with error: ${await response.text()}`);
    }
}

async function openModal(meal) {
    editModal.style.display = "block";

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