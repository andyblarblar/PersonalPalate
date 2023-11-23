import math
import statistics
from collections import Counter
from datetime import date, timedelta, datetime
from typing import List
from personalpalate.orm.model import Meal


'''
# Function to construct the probability mass function for the dataset
# Parameters
#   - meals (type: list[meal class objects]): list of meals in a user's dataset
#   - past_choices (type: list[tuple[str, datetime.date]]): list containing each meal chosen and the date chosen
# Returns: meal_selection (type: string): selected meal from PMF
'''
def construct_pmf(meals: List[Meal], past_choices: List[Tuple[str, datetime.date]]) -> str:

    # frequency of each mealName in the dataset
    freq = Counter(meals.mealName)
    total_count = len(meals)

    # Constructing the PMF based on the frequency in the dataset
    pmf = {value: freq[values] / total_count for values in freq}

    # apply recency_weight
    for meal_name, meal_date in past_choices:
        recency_weight = (1 / (date.today() - meal_date))

        # taking n-th root of probability - as distance increases, n increases
        pmf[meal_name] = pmf[meal_name] ** (recency_weight)

    # create a dictionary to hold each meal and the dates cooked
    meal_dict = {}
    for meal in meals:
        if meal.mealName not in meals_dict:
            meals_dict[meal.mealName] = [meal.dateMade]
        else:
            meals_dict[meal.mealName].append(meal.dateMade)

    # compute the average date the meal is cooked
    meal_avg = {name_of_meal: datetime.min + (sum(meals_dict[meal], datetime.min) / len(meals_dict[meal])) for meal in meals_dict}

    # apply seasonal weight
    for meal in meals:
        seasonal_weight = 1 / (date.today() - meal_avg[meal.mealName])
        pmf[meal.mealName] *= seasonal_weight

    # calculate the adjusted total probability for normalization
    total_probability = sum(pmf.values())

    # normalize the PMF
    for meal_name in pmf:
        pmf[meal_name] /= total_probability

    # select a meal based on the probability
    meal_selection = random.choices(list(pmf.keys()), weights = list(pmf.values()), k = 1)[0]

    return meal_selection




