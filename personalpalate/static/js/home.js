const logout = document.getElementById("logout");
const mealDate = document.getElementById("selectedDate");
const mealForm = document.getElementById("recommendation");
const changeMeal = document.getElementById("changeMeal");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close");
const multiMeal = document.getElementById("multiMeal");
const addMeals = document.getElementById("addMeals");
const createMeals = document.getElementById("createMeals");
const settings = document.getElementById("settings");
const mealPlanTable = document.getElementById("mealPlanTable");
const endDate = document.getElementById("endDate");

logout.addEventListener("click", () => {
    window.location = '/logout';
});

settings.addEventListener("click", () => {
  window.location = '/settings';
});

mealForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedCategory = document.getElementById("categories").value;
  getRecommendation(selectedCategory).then((plan) => {
    const recommendedMeal = plan.mealName;
    const shouldSaveMeal = confirm(`Recommended Meal: ${recommendedMeal}. Select OK to save or Cancel to discard the recommendation.`);

    if (shouldSaveMeal) {
      saveMeal(plan, true);
      configureMealsContainer();
    }
  });
});

changeMeal.addEventListener("click", () => {
  const noMealPlan = document.getElementById("no-meal-plan");
  const noMeals = document.getElementById("no-meals");
  const mealPlan = document.getElementById("meal-plan");

  getCategories().then((categories) => {
    if (categories.length === 0) {
      alert("You have no meals saved! Add meals to generate a recommendation.");
    } else {
      setCategories(categories);
      noMealPlan.hidden = false;
      noMeals.hidden = true;
      mealPlan.hidden = true;
    }
  });
});

multiMeal.addEventListener("click", () => {
  modal.style.display = "block";
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

addMeals.addEventListener("click", () => {
  window.location = "/meals";
});

createMeals.addEventListener("click", () => {
  window.location = "/meals";
});

window.onclick = function(event) {
  if (event.target === modal) modal.style.display = "none";
}

endDate.addEventListener("change", async () => {
  const startDate = document.getElementById("startDate");
  if (startDate.value) {
    if (mealPlanTable.childElementCount > 0) {
      deleteChildNodes(mealPlanTable)
    }

    const button = document.getElementById("massRecommendButton");
    const button2 = document.getElementById("saveMealButton");
    if (button)
      button.parentNode.removeChild(button);
    if (button2)
      button2.parentNode.removeChild(button2);

    mealPlanTable.style.display = "table";

    let end = convertDateToUTC(new Date(endDate.value));
    let loop = convertDateToUTC(new Date(startDate.value));

    const categoriesSelect = document.createElement("select");
    const anyOption = document.createElement("option");
    anyOption.value = "any";
    anyOption.innerText = "Any category";
    categoriesSelect.appendChild(anyOption);

    const categories = await getCategories();
    if (!categories) {
      alert("Add meals to create a meal plan!");
      return;
    }

    categories.forEach((category) => {
      let option = document.createElement("option");
      const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
      option.value = category;
      option.textContent = capitalized;
      categoriesSelect.appendChild(option);
    });

    categoriesSelect.value = "any";

    while (loop <= end) {
      const date = loop.toISOString().split("T")[0];

      const tableRow = document.createElement("div");
      tableRow.classList.add("table-entry");

      const dateEntry = document.createElement("div");
      dateEntry.classList.add("table-date");
      dateEntry.innerText = date;

      const categoryEntry = document.createElement("div");
      categoryEntry.classList.add("table-category");
      categoryEntry.appendChild(categoriesSelect.cloneNode(true));

      tableRow.appendChild(dateEntry);
      tableRow.appendChild(categoryEntry);

      mealPlanTable.appendChild(tableRow);
      const newDate = loop.setDate(loop.getDate() + 1);
      loop = new Date(newDate);
    }

    const recommendationsButton = document.createElement("div");
    recommendationsButton.classList.add("button", "meal-button");
    recommendationsButton.innerText = "Get Recommendations";
    recommendationsButton.id = "massRecommendButton";
    recommendationsButton.addEventListener("click", async () => {
      for (const child of mealPlanTable.children) {
        const date = child.children[0].innerText;
        const category = child.children[1].firstChild.value;

        getRecommendation(category, date).then((recommendation) => {
          if (child.children.length === 3) {
            child.children[2].innerText = recommendation.mealName;
          } else {
            const mealNameEntry = document.createElement("div");
            mealNameEntry.classList.add("table-meal-name");
            mealNameEntry.innerText = recommendation.mealName;
            child.appendChild(mealNameEntry);
          }
        });
      }

      if (mealPlanTable.parentNode.children.length === 2) {
        const saveMeals = document.createElement("div");
        saveMeals.classList.add("button", "meal-button");
        saveMeals.innerText = "Save Meals";
        saveMeals.id = "saveMealButton";

        saveMeals.addEventListener("click", async () => {
          for (const child of mealPlanTable.children) {
            const date = child.children[0].innerText;
            const mealName = child.children[2].innerText;

            const data = {
              mealPlanDate: date,
              mealName: mealName
            }
            await saveMeal(data, false);
          }
          configureMealsContainer();
          window.location.reload();
          modal.style.display = "none";
          startDate.value = "";
          endDate.value = "";
          deleteChildNodes(mealPlanTable);
          mealPlanTable.style.display = "none";
          mealPlanTable.parentNode.removeChild(saveMeals);
          mealPlanTable.parentNode.removeChild(recommendationsButton);
        });

        mealPlanTable.parentNode.appendChild(saveMeals);
      }
    });
    mealPlanTable.parentNode.appendChild(recommendationsButton);
  }
});


function deleteChildNodes(element) {
  while (element.firstChild)
    element.removeChild(element.lastChild);
}


async function saveMeal(mealPlan, informUser) {
  const data = {
    "mealPlanDate": mealPlan.mealPlanDate,
    "mealName": mealPlan.mealName
  }
  let string = JSON.stringify(data);
  const response = await fetch("/plans", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: string
  });

  if (informUser) {
    if (response.ok) {
    alert("Meal saved successfully!");
  } else {
    alert(`Meal failed to save with error: ${await response.text()}`)
  }
  }
}

async function getRecommendation(category, date) {
  let url = "/recommend?day=";
  if (date) {
    url += date;
  } else url += `${document.getElementById("selectedDate").innerText}`
  if (category !== "any") url += "&category=" + category;

  const response = await fetch(url);

  return await response.json();
}

async function getCategories() {
    try {
        const response = await fetch("/meal/followed"); // Replace with new endpoint for followed and owned meals
        const data = await response.json();

        return [...new Set(data.map(meal => meal.category))];
    }
    catch (error) {
        console.error("Error fetching meal categories:", error);
        return [];
    }
}

async function getMealPlan(date) {
  // Accepts date in yyyy-mm-dd format
  try {
    const response = await fetch("/plans");
    const data = await response.json();

    let existingPlan = null;
    data.forEach((plan) => {
      if (plan.mealPlanDate === date) {
        existingPlan = plan;
      }
    });
    return existingPlan;
  }
  catch (error) {
    console.error("Error fetching meal plans:", error)
    return null;
  }
}

async function configureMealsContainer() {
  /* Need to configure the meal container. There are three views:
  * 1. The user has no meals in the system. (getCategories returns []) - Direct them to add meal instead
  * 2. The user has meals in the system, but no meal plan is chosen for the day (getCategories returns array with length
  * > 1, but meal plan endpoint has no meal for the date). - Direct user to generate recommendation
  * 3. The user has meals in the system and there is a meal plan for the selected date - Option for user to regenerate
  * the meal recommendation */
  const categories = await getCategories();

  const noMealPlan = document.getElementById("no-meal-plan");
  const noMeals = document.getElementById("no-meals");
  const mealPlan = document.getElementById("meal-plan");

  if (categories.length === 0) {
    // view 1
    noMealPlan.hidden = true;
    noMeals.hidden = false;
    mealPlan.hidden = true;
    multiMeal.style.display = "none";
  } else {
    multiMeal.style.display = "block";
    const date = document.getElementById("selectedDate").innerText
    getMealPlan(date).then((plan) => {
      if (plan) {
        // view 3
        document.getElementById("meal").innerText = "Planned Meal: " + plan.mealName;
        noMealPlan.hidden = true;
        noMeals.hidden = true;
        mealPlan.hidden = false;
      } else {
        // view 2
        setCategories(categories);
        noMealPlan.hidden = false;
        noMeals.hidden = true;
        mealPlan.hidden = true;
      }
    });
  }
}

function setCategories(categories) {
  const categoriesDropdown = document.getElementById("categories");
  if (categoriesDropdown.childElementCount > 1) return;

  categories.forEach(function (category) {
    let option = document.createElement("option");
    const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
    option.value = category;
    option.textContent = capitalized;
    categoriesDropdown.appendChild(option);
  });
}

function convertDateToUTC(date) {
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds())

}

// Content below provided by https://alvarotrigo.com/blog/css-calendar/
function CalendarControl() {
    const calendar = new Date();
    const calendarControl = {
      localDate: new Date(),
      prevMonthLastDate: null,
      calWeekDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      calMonthName: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],
      selectedDate: null,
      daysInMonth: function (month, year) {
        return new Date(year, month, 0).getDate();
      },
      firstDay: function () {
        return new Date(calendar.getFullYear(), calendar.getMonth(), 1);
      },
      lastDay: function () {
        return new Date(calendar.getFullYear(), calendar.getMonth() + 1, 0);
      },
      firstDayNumber: function () {
        return calendarControl.firstDay().getDay() + 1;
      },
      lastDayNumber: function () {
        return calendarControl.lastDay().getDay() + 1;
      },
      getPreviousMonthLastDate: function () {
        let lastDate = new Date(
          calendar.getFullYear(),
          calendar.getMonth(),
          0
        ).getDate();
        return lastDate;
      },
      navigateToPreviousMonth: function () {
        calendar.setMonth(calendar.getMonth() - 1);
        calendarControl.attachEventsOnNextPrev();
      },
      navigateToNextMonth: function () {
        calendar.setMonth(calendar.getMonth() + 1);
        calendarControl.attachEventsOnNextPrev();
      },
      navigateToCurrentMonth: function () {
        calendarControl.selectedDate = null;
        let currentMonth = calendarControl.localDate.getMonth();
        let currentYear = calendarControl.localDate.getFullYear();
        calendar.setMonth(currentMonth);
        calendar.setYear(currentYear);
        calendarControl.attachEventsOnNextPrev();
      },
      displayYear: function () {
        let yearLabel = document.querySelector(".calendar .calendar-year-label");
        yearLabel.innerHTML = calendar.getFullYear();
      },
      displayMonth: function () {
        let monthLabel = document.querySelector(
          ".calendar .calendar-month-label"
        );
        monthLabel.innerHTML = calendarControl.calMonthName[calendar.getMonth()];
      },
      selectDate: function (e) {
        let date = {
          "day": `${e.target.textContent}`,
          "month": calendar.getMonth()+1,
          "year": calendar.getFullYear()
        }
        calendarControl.selectedDate = date;
        calendarControl.highlightDate(date);
      },
      plotSelectors: function () {
        document.querySelector(
          ".calendar"
        ).innerHTML += `<div class="calendar-inner"><div class="calendar-controls">
          <div class="calendar-prev"><a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><path fill="#666" d="M88.2 3.8L35.8 56.23 28 64l7.8 7.78 52.4 52.4 9.78-7.76L45.58 64l52.4-52.4z"/></svg></a></div>
          <div class="calendar-year-month">
          <div class="calendar-month-label"></div>
          <div><b>-</b></div>
          <div class="calendar-year-label"></div>
          </div>
          <div class="calendar-next"><a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><path fill="#666" d="M38.8 124.2l52.4-52.42L99 64l-7.77-7.78-52.4-52.4-9.8 7.77L81.44 64 29 116.42z"/></svg></a></div>
          </div>
          <div class="calendar-today-date">Today: 
            ${calendarControl.calWeekDays[calendarControl.localDate.getDay()]}, 
            ${calendarControl.localDate.getDate()}, 
            ${calendarControl.calMonthName[calendarControl.localDate.getMonth()]} 
            ${calendarControl.localDate.getFullYear()}
          </div>
          <div class="calendar-body"></div></div>`;
      },
      plotDayNames: function () {
        for (let i = 0; i < calendarControl.calWeekDays.length; i++) {
          document.querySelector(
            ".calendar .calendar-body"
          ).innerHTML += `<div>${calendarControl.calWeekDays[i]}</div>`;
        }
      },
      plotDates: async function () {
        document.querySelector(".calendar .calendar-body").innerHTML = "";
        calendarControl.plotDayNames();
        calendarControl.displayMonth();
        calendarControl.displayYear();
        let count = 1;
        let prevDateCount = 0;
        let date = `${calendar.getFullYear()}-${(calendar.getMonth()+1).toString().padStart(2, "0")}-`;

        let response = await fetch("/plans");
        let mealPlans = await response.json();

        const plansByDate = {};
        mealPlans.forEach(plan => {
          plansByDate[plan.mealPlanDate] = plan;
        });

        calendarControl.prevMonthLastDate = calendarControl.getPreviousMonthLastDate();
        let prevMonthDatesArray = [];
        let calendarDays = calendarControl.daysInMonth(
          calendar.getMonth() + 1,
          calendar.getFullYear()
        );
        // dates of current month
        for (let i = 1; i < calendarDays; i++) {
          if (i < calendarControl.firstDayNumber()) {
            prevDateCount += 1;
            document.querySelector(
              ".calendar .calendar-body"
            ).innerHTML += `<div class="prev-dates"></div>`;
            prevMonthDatesArray.push(calendarControl.prevMonthLastDate--);
          } else {
            const day = count.toString().padStart(2, "0");

            if (plansByDate.hasOwnProperty(`${date}${day}`)) {
              document.querySelector(".calendar .calendar-body").innerHTML
                += `<div class="number-item calendar-meal" data-num=${count}><a class="dateNumber" href="#">${count++}</a></div>`;
            } else
            document.querySelector(".calendar .calendar-body").innerHTML
                += `<div class="number-item" data-num=${count}><a class="dateNumber" href="#">${count++}</a></div>`;
          }
        }
        //remaining dates after month dates
        for (let j = 0; j < prevDateCount + 1; j++) {
          const day = count.toString().padStart(2, "0");
          if (plansByDate.hasOwnProperty(`${date}${day}`)) {
            document.querySelector(".calendar .calendar-body").innerHTML
              += `<div class="number-item calendar-meal" data-num=${count}><a class="dateNumber" href="#">${count++}</a></div>`;
          } else
          document.querySelector(".calendar .calendar-body").innerHTML
              += `<div class="number-item" data-num=${count}><a class="dateNumber" href="#">${count++}</a></div>`;
        }
        if (calendarControl.selectedDate) {
          calendarControl.highlightDate(calendarControl.selectedDate);
        } else {
          calendarControl.highlightToday();
        }
        calendarControl.plotPrevMonthDates(prevMonthDatesArray);
        calendarControl.plotNextMonthDates();
      },
      attachEvents: function () {
        let prevBtn = document.querySelector(".calendar .calendar-prev a");
        let nextBtn = document.querySelector(".calendar .calendar-next a");
        let todayDate = document.querySelector(".calendar .calendar-today-date");
        let dateNumber = document.querySelectorAll(".calendar .dateNumber");
        prevBtn.addEventListener(
          "click",
          calendarControl.navigateToPreviousMonth
        );
        nextBtn.addEventListener("click", calendarControl.navigateToNextMonth);
        todayDate.addEventListener(
          "click",
          calendarControl.navigateToCurrentMonth
        );
        for (let i = 0; i < dateNumber.length; i++) {
            dateNumber[i].addEventListener(
              "click",
              calendarControl.selectDate,
              false
            );
        }
      },
      highlightDate: function (date) {
        let day = date.day;
        let month = date.month;
        let year = date.year;
        let calendarMonth = calendar.getMonth() + 1;
        let calendarYear = calendar.getFullYear();

        // Need to remove current highlight and apply new one
        let elem = document.querySelector(".calendar-today");
        if (elem) elem.classList.remove("calendar-today");
        if (
            calendarYear === year &&
            calendarMonth === month
        ) {
          document.querySelectorAll(".number-item")[day - 1].classList.add("calendar-today");
          configureMealsContainer();
        }

        let monthString = `${month}`;
        monthString = monthString.padStart(2, "0");
        day = day.padStart(2, "0");
        mealDate.innerText = `${year}-${monthString}-${day}`;
      },
      highlightToday: function () {
        let currentMonth = calendarControl.localDate.getMonth() + 1;
        let changedMonth = calendar.getMonth() + 1;
        let currentYear = calendarControl.localDate.getFullYear();
        let changedYear = calendar.getFullYear();
        if (
          currentYear === changedYear &&
          currentMonth === changedMonth &&
          document.querySelectorAll(".number-item")
        ) {
          document
            .querySelectorAll(".number-item")
            [calendar.getDate() - 1].classList.add("calendar-today");
          configureMealsContainer();
        }

        let monthString = `${currentMonth}`;
        let day = `${calendar.getDate()}`;
        monthString = monthString.padStart(2, "0");
        day = day.padStart(2, "0");
        mealDate.innerText = `${currentYear}-${monthString}-${day}`;
      },
      plotPrevMonthDates: function(dates){
        dates.reverse();
        for(let i=0;i<dates.length;i++) {
            if(document.querySelectorAll(".prev-dates")) {
                document.querySelectorAll(".prev-dates")[i].textContent = dates[i];
            }
        }
      },
      plotNextMonthDates: function(){
       let childElemCount = document.querySelector('.calendar-body').childElementCount;
       //7 lines
       if(childElemCount > 42 ) {
           let diff = 49 - childElemCount;
           calendarControl.loopThroughNextDays(diff);
       }

       //6 lines
       if(childElemCount > 35 && childElemCount <= 42 ) {
        let diff = 42 - childElemCount;
        calendarControl.loopThroughNextDays(diff);
       }

      },
      loopThroughNextDays: function(count) {
        if(count > 0) {
            for(let i=1;i<=count;i++) {
                document.querySelector('.calendar-body').innerHTML += `<div class="next-dates">${i}</div>`;
            }
        }
      },
      attachEventsOnNextPrev: function () {
        calendarControl.plotDates().then(() => {
          calendarControl.attachEvents();
        });
      },
      init: function () {
        calendarControl.plotSelectors();
        calendarControl.plotDates().then(() => {
           calendarControl.attachEvents();
        });
      }
    };
    calendarControl.init();
  }
const calendarControl = new CalendarControl();
