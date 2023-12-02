const logout = document.getElementById("logout");
const mealDate = document.getElementById("selectedDate");
const mealForm = document.getElementById("recommendation");

logout.addEventListener("click", () => {
    window.location = '/logout';
});

mealForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedCategory = document.getElementById("categories").value;
  getRecommendation(selectedCategory).then((plan) => {
    const recommendedMeal = plan.mealName;
    const shouldSaveMeal = confirm(`Recommended Meal: ${recommendedMeal}. Select OK to save or Cancel to discard the recommendation.`);

    if (shouldSaveMeal) {
      let _ = saveMeal(plan);
      configureMealsContainer();
    }
  });
});

async function saveMeal(mealPlan) {
  console.log(mealPlan);
  const response = await fetch("/plans", {
    method: "PUT",
    body: mealPlan
  });

  if (response.ok) {
    alert("Meal saved successfully!");
  } else {
    alert(`Meal failed to save with error: ${await response.text()}`)
  }
}

async function getRecommendation(category) {
  let url = `/recommend?day=${document.getElementById("selectedDate").innerText}`
  if (category !== "any") url += category;

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
  console.log("Getting meal plan for date:", date);
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
  /* Need to configure the meals container. There are three views:
  * 1. The user has no meals in the system. (getCategories returns []) - Direct them to add meal instead
  * 2. The user has meals in the system, but no meal plan is chosen for the day (getCategories returns array with length
  * > 1, but meal plan endpoint has no meal for the date. - Direct user to generate recommendation
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
  } else {
    const date = document.getElementById("selectedDate").innerText
    getMealPlan(date).then((plan) => {
      if (plan) {
        // view 3
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
          // Date logged to console here. Need to instead check if meal plan exists for clicked date.
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
      plotDates: function () {
        document.querySelector(".calendar .calendar-body").innerHTML = "";
        calendarControl.plotDayNames();
        calendarControl.displayMonth();
        calendarControl.displayYear();
        let count = 1;
        let prevDateCount = 0;

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
            document.querySelector(
              ".calendar .calendar-body"
            ).innerHTML += `<div class="number-item" data-num=${count}><a class="dateNumber" href="#">${count++}</a></div>`;
          }
        }
        //remaining dates after month dates
        for (let j = 0; j < prevDateCount + 1; j++) {
          document.querySelector(
            ".calendar .calendar-body"
          ).innerHTML += `<div class="number-item" data-num=${count}><a class="dateNumber" href="#">${count++}</a></div>`;
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
        for (var i = 0; i < dateNumber.length; i++) {
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
          let _ = configureMealsContainer();
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
          let _ = configureMealsContainer();
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
        calendarControl.loopThroughNextDays(42 - childElemCount);
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
        calendarControl.plotDates();
        calendarControl.attachEvents();
      },
      init: function () {
        calendarControl.plotSelectors();
        calendarControl.plotDates();
        calendarControl.attachEvents();
      }
    };
    calendarControl.init();
  }
const calendarControl = new CalendarControl();
