import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView'; //remember 'searchView' will be an object in which all the exported variables from searchView.js module will be stored
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';
import Likes from './models/Likes';

/*Global state of the app
- Search object --> in here we have both search query and search result
- Current recipe object 
- Shopping list object
- Liked recipes
So all the above can be accessed in the 'state' variable below
 */
const state = {} //Each time we reload the app, this state will be empty, unless we make some parts of the state persistent

/*
***
THIS IS THE SEARCH CONTROLLER
***
*/
const controlSearch = async () => {
    // 1) Get query from view
    const query = searchView.getInput();

    // If there is a query, we wanna create a new Search object
    if(query) {
        // 2) New search object, and add it to state
        state.search = new Search(query);
        // 3) Prepare UI for results. e.g. clearing previous results, or showing a loading spinner
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4) Actually do search. so we will search for recipes
            await state.search.getResults();

            // 5) AFTER RECEIVING RESULT FROM API, Render results on UI. Therefore we 'await' step 4 above.
            clearLoader();
            searchView.renderResults(state.search.result);   
        } catch(err) {
            console.log('Something wrong with the search...');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => { //Speaking generally, event listeners go to the controller so that we can delegate
    e.preventDefault() //Stop reloading when you click on 'Search'
    controlSearch();
}) 

//How can we attach the eventListeners when the pagination buttons are not there yet when the page is loaded? So we use event delegation like in Budget app:
//Event delegation is when we attach an eventListener to an element that is already there, figure out where the click happens, and then do something based on that
//So the parent of the pagination buttons is '.results__pages' so that is where we put the eventListener
elements.searchResPages.addEventListener('click', e => {
    //Sometimes when trying to click on the button, we click on the 'span' element, or 'svg' or something, but we are only interested in clicks on the button itself,
    //so this is why we use the 'closest' method. It will find the closest element with the class that we pass as parameter ('btn-inline').
    const btn = e.target.closest('.btn-inline'); //Now, doesnt matter if you click on 'span' or 'svg' etc, it will all be registered as 'btn-inline'

    if(btn) {
        const goToPage = Number(btn.dataset.goto);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
})


/*
***
THIS IS THE RECIPE CONTROLLER
***
*/
const controlRecipe = async () => {
    //1) get the hash. 'window.location' is the entire URL. With '.hash' it is gonna give only the hash
    const id = window.location.hash.replace('#', ''); //We dont need the #. Just need the number/id
    console.log(id);

    if(id) {
        //Prepare UI for changes
        recipeView.clearRecipe(); //Just clearing recipe before loading a new one
        renderLoader(elements.recipe);//Need to pass the parent so the loader knows where to display itself

        //Highlight selected search item. We use it here because this happens as soon as we load a recipe
        if(state.search) searchView.highlightSelected(id);

        //Create new recipe objects. Again we will use the state object
        state.recipe = new Recipe(id)

        try {
            //Get recipe data and parse ingredients
            await state.recipe.getRecipe(); 
            state.recipe.parseIngredients();
            //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            //Lastly, we can render the recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
            //At this stage,we click a recipe from the left column and it will show that particular recipe.
        } catch(error) {
            console.log('Error processing recipe!');
        }
    }
}

/*
We are adding the eventListener to the global object in js, which is Window. hashchange is anytime there is a change in the URL hash (for the id)

window.addEventListener('hashchange', controlRecipe);

If we reload the page, no recipe would be selected because the hash does not change, so the above event does not fire. So we add eventListener to the load event which is fired
whenever the page is loaded

window.addEventListener('load', controlRecipe);

Adding the same eventListener to different events can also be written like this: 
*/
['hashchange', 'load'].forEach(element => window.addEventListener(element, controlRecipe));


/*
***
THIS IS THE LIST CONTROLLER
***
*/
const controlList = () => {
    //Create a new list IF there is none yet
    if(!state.list) state.list = new List();

    //Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient)
        listView.renderItem(item);
    })
}

//Handle delete and update list item events (the plus and minus of the right column, and deleting the ingredient)
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid //Again, closest is very helpful.No matter where you click, it will go to the closest .shopping__item and get the itemid

    //Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {//Use matches because we are trying to see if our target matches the 'shopping__delete' class
        //Delete from state
        state.list.deleteItem(id);
        //Delete from UI
        listView.deleteItem(id);

    //Handle the count update
    } else if(e.target.matches('.shopping__count-value')) { //There are no children so just the '.shopping__count-value' itself
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
})

/*
***
THIS IS THE LIKE CONTROLLER
***
*/
state.likes = new Likes();
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    //User has NOT liked a recipe
    if(!state.likes.isLiked(currentID)) {
        //Add the like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //Toggle the like button
        likesView.toggleLikeBtn(true) //True because this IF statement is for when the user has NOT liked the recipe

        //Add like to UI list
        likesView.renderLike(newLike);
    } else {
        //Remove the like from the state
        state.likes.deleteLike(currentID)

        //Toggle the like button
        likesView.toggleLikeBtn(false)
        //Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}


//Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();//At this stage, after loading the page, obviously this will be empty
    state.likes.readStorage();//Now, its not empty anymore
    likesView.toggleLikeMenu(state.likes.getNumLikes());//Toggle like menu button
    state.likes.likes.forEach(like => likesView.renderLike(like));//Render existing likes
})


//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {//The second one means 'any child element of 'btn-decrease' class
        //Decrease button is clicked
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec')
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if(e.target.matches('.btn-increase, .btn-increase *')) {
        //Increase button is clicked
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) { //The * means all of the child elements of .recipe__btn--add. This is because the click may not be exactly 
        //on target, but maybe on the child elements like the SVG, span, etc.

        //Add ingredients to the shopping list
        controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')) {
        //Like controller
        controlLike();
    }
})