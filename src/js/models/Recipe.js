import axios from 'axios';
import {proxy, key} from '../config';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`)
            //At this point, 'res' was logged to console and inside 'data.recipe', we look at all the data we want to display
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;//Remember this ingredients is an array
        } catch (error){
            console.log(error);

        }
    }

    //This is for the cooking duration that is displayed on the center of the screen - the recipe. Its just an estimation, assuming for every 3 ingredients we need 15 minutes
    calcTime() {
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;//Just a simple random number
    }

    parseIngredients() { //This is to make all the unit of measurements the same. Because theres tablespoon, tablespoonS, cup, cupS, ounce, ounces, etc.
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds']; //These are the untis as they appear in our ingredients
        const unitsShort =['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound']; //These are what we want the units to be
        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map(el => {
            //1) Make all units the same
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]); //Basically replace for example tablespoons to tbsp. So now 'ingredient' contains the short unit.
            });

            //2) Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");


            //3) Parse ingredients into count, unit, and the ingredient itself. This is most complex because you have things like '1/2 cup flour', '1/4 tbsp sugar' etc. How do we
            //separate them into count, unit and the ingredient itself?
            
            const arrIng = ingredient.split(' ');//Is there a unit in the string? If so, where is it located? SO we convert the ingredient into an array
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));//Find the index where the unit is located, when we dont know which unit we are looking for

            let objIng;
            if(unitIndex > -1) {
                //means if there is a unit

                //Example for below: 4 1/2 cups, arrCount will be [4, 1/2]
                //Example for below: 4 cups, arrCount will be [4]
                const arrCount = arrIng.slice(0, unitIndex); 
                let count;
                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+')); //So if there is only 1 element before the unit, that element must be the number itself
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+')); //eval('4+1/2') will be 4.5. It will do the math
                }

                objIng = {
                    count, //Same as writing count: count
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            } else if (Number(arrIng[0])) { //This is for stuff like '1 bread'. The '1' will always be in front
                //means there is no unit BUT 1st element is a number
                objIng = {
                    count: Number(arrIng[0]),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ') //Entire array except the first element
                }
            } else if(unitIndex === -1) {
                //means there is no unit and no number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient // Same as writing ingredient: ingredient from step 2 above. its ES6
                }
            }
            

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        })

        this.servings = newServings;
    }
}