from collections import Counter, defaultdict
from datetime import timedelta
import datetime
import random
from .orm.model import MealDTO


def construct_pmf(
    meals: list[MealDTO],
    past_choices: list[tuple[str, datetime.date]],
    date: datetime.date,
) -> str:
    """
    # Function to construct the probability mass function for the dataset
    # Parameters
    #   - meals (type: list[meal class objects]): list of meals in a user's dataset
    #   - past_choices (type: list[tuple[str, datetime.date]]): list containing each meal chosen and the date chosen
    # Returns: meal_selection (type: string): selected meal from PMF
    """

    # frequency of each mealName in the dataset
    freq = Counter(m.mealName for m in meals)
    total_count = len(meals)

    # Constructing the PMF based on the frequency in the dataset
    pmf = {value: freq[value] / total_count for value in freq}

    # apply recency_weight
    for meal_name, meal_date in past_choices:
        recency_weight = 1 / (date - meal_date)

        # taking n-th root of probability - as distance increases, n increases
        pmf[meal_name] = pmf[meal_name] ** recency_weight

    # create a dictionary to hold each meal and the dates cooked
    meal_dict = defaultdict(list)
    for meal in meals:
        meal_dict[meal.mealName].append(meal.dateMade)

    # compute the sum of dates for each meal
    average_day_meal = {}
    for meal, dates in meal_dict.items():
        total_day_num = sum(d.timetuple().tm_yday for d in dates)
        # compute the average day of each meal
        avg_day = total_day_num / len(dates)
        average_day_meal[meal] = int(avg_day)

    # apply seasonal weight
    for meal in average_day_meal:
        difference_date = date - timedelta(days=average_day_meal[meal])
        distance = difference_date.timetuple().tm_yday
        seasonal_weight = 1 / distance
        pmf[meal] *= seasonal_weight

    # calculate the adjusted total probability for normalization
    total_probability = sum(pmf.values())

    # normalize the PMF
    for meal_name in pmf:
        pmf[meal_name] /= total_probability

    # select a meal based on the probability
    meal_selection = random.choices(list(pmf.keys()), weights=list(pmf.values()), k=1)[
        0
    ]

    return meal_selection
