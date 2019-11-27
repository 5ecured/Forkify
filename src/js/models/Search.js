import axios from 'axios'; //To import the Axios library(because fetch only works for modern browsers). Notice its from 'axios', exact name as the one in package.json
//axios also automatically returns json. In fetch you hvae to .json() it but axios you dont have to

import {proxy, key} from '../config';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`) //Remember this returns a promise. The URL is from food2fork docs.
        this.result = res.data.recipes; //Remember, we want to save the result in the object/instance, so we use 'this'
    }

}
