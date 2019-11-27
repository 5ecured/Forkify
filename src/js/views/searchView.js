import {elements} from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResults =() => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
}

export const highlightSelected = id => { //This is for when a recipe is selected, that recipe on the left column will have a grey background
    const resultsArray = Array.from(document.querySelectorAll('.results__link')); //Put all results in an array, so we can remove the class from all of them
    resultsArray.forEach(el => {
        el.classList.remove('results__link--active');
    })
    document.querySelector(`.results__link[href="#${id}"]`).classList.toggle('results__link--active');//The only problem is you click the next one they will both be active. Solution? prev comment:
};

/*
'Pasta with tomato and spinach'
acc: 0 / acc + cur.length = 5 / newTitle = ['Pasta']
acc: 5 / acc + cur.length = 9 / newTitle = ['Pasta', 'with']
acc: 9 / acc + cur.length = 15 / newTitle = ['Pasta', 'with', 'tomato']
acc: 15 / acc + cur.length = 18 / newTitle = ['Pasta', 'with', 'tomato']
acc: 18 / acc + cur.length = 25 / newTitle = ['Pasta', 'with', 'tomato']
*/
export const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if(title.length > limit) {
        title.split(' ').reduce((acc, cur) => {
            if(acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0)

        return `${newTitle.join(' ')} ...`;
    }
    return title;
}

const renderRecipe = recipe => { //no export because we only need this function in this module. 
    //You can write HTML code by using template literals. Then, we can replace the static data with dynamic ones from the API
    const markup = ` 
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
}

//'type' below can be either 'prev' or 'next'
//Whenever we prefix an attribute with 'data' in front of it like below, the variable will be stored inside 'dataset.${variable name}'. So here it will be dataset.goto
const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>        
    </button>
`;

const renderButtons = (page, numResults, resPerPage) => { //This is for the actual buttons. Page 1, Page 2, etc.
    //First we need to know what page we are on and how many pages there are.
    const pages = Math.ceil(numResults / resPerPage); //To find out how many pages there are. Use Math.ceil to round up

    let button;
    if(page === 1 && pages > 1) { //if only 'page === 1' then we should not have a button.
        //Only 1 button to go to next page
        button = createButton(page, 'next');
    } else if (page < pages) { //If we are in the middle pages
        //Both buttons
        button = `
            ${createButton(page, 'next')}
            ${createButton(page, 'prev')}
        `
    } else if (page === pages && pages > 1) { //Which means if we are on the last page
        //Only 1 button to go to previous page
        button = createButton(page, 'prev');
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button); //Finally, insert these buttons into the DOM
}

//The thinking is that 'state.search.result' from index.js has all the 30 recipes. We now want to display it in the UI. So we go to 'state.search.result' and go through each item 
//to display it.
export const renderResults = (recipes, page = 1, resPerPage = 10) => {
    const start = (page - 1) * resPerPage; //The logic for displaying 10 reicpes on each page. So 1st page will be 0 * resPerPage. then 2nd page will be 1 * resPerPage. index based kan
    const end = page * resPerPage;
    
    //This is only going to loop through the array and call renderRecipe on each element. The logic will be done in 'renderRecipe'
    //Because we are not displaying all 30, we use .slice to display 10 on each page.
    recipes.slice(start, end).forEach(renderRecipe) 

    //Render the pagination buttons
    renderButtons(page, recipes.length, resPerPage);
};
