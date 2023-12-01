const mealPlan1 = document.getElementById("createMealPlan");
const mealPlan2 = document.getElementById("createMealPlan2");
const logout = document.getElementById("logout");
const modal = document.getElementById("mealModal");
const closeModal = document.getElementsByClassName("close")[0];

mealPlan1.addEventListener("click", createMealPlan);
mealPlan2.addEventListener("click", createMealPlan);
logout.addEventListener("click", () => {
    window.location = '/logout';
});
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
})

async function createMealPlan() {
    // Need to add functionality to create a meal plan
    modal.style.display = "block";
    const categories = await getCategories();
    console.log("Meal Categories: ", categories);
}

window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

async function getCategories() {
    try {
        const response = await fetch("/meal"); // Replace with new endpoint for followed and owned meals
        const data = await response.json();

        return [...new Set(data.map(meal => meal.category))];
    }
    catch (error) {
        console.error("Error fetching meal categories: ", error);
        return [];
    }
}
