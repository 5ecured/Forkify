//Its good to have one central place for all the DOM elements. That is why we created this base.js module

export const elements = {
    searchForm: document.querySelector('.search'),
    searchInput: document.querySelector('.search__field'),
    searchRes: document.querySelector('.results'),
    searchResList: document.querySelector('.results__list'),
    searchResPages: document.querySelector('.results__pages'),
    recipe: document.querySelector('.recipe'),
    shopping: document.querySelector('.shopping__list'),
    likesMenu: document.querySelector('.likes__field'),
    likesList: document.querySelector('.likes__list')
}

export const elementStrings = {
    loader: 'loader'
};

export const renderLoader = parent => { //We will attach this renderLoader as a child of the parent element
    const loader = `
        <div class='${elementStrings.loader}'>
            <svg>
                <use href='img/icons.svg#icon-cw'></use>
            </svg>
        </div>
    `;
    parent.insertAdjacentHTML('afterbegin', loader);
}

export const clearLoader = () => { //This is to remove the loader after the results have been displayed
    const loader = document.querySelector(`.${elementStrings.loader}`);
    //If the loader exists, delete it. Remember that deleting an element in DOM is by going to the parent and then deleting the child
    if(loader) {
        loader.parentElement.removeChild(loader);
    }
}