import uniqid from 'uniqid';

export default class List {
    constructor() {
        this.items = []; //So when we create a new object from List, they will all be pushed into this array
    }

    addItem(count, unit, ingredient) { //So in the 'items' array we will have many objects, and each will have these 3 parameters
        const item = { //Remember, in ES6, the below is exactly the same as count: count, unit: unit, etc.
            id: uniqid(),
            count,
            unit,
            ingredient
        }
        this.items.push(item);
        return item;
    }

    deleteItem(id) {
        const index = this.items.findIndex(el => el.id === id); //See if the id of the item matches the id from the parameter
        //[2,4,8].splice(1,2) --> returns 4,8. original array is [2]. the 2nd '1' is 'how many elements we wanna take'
        //[2,4,8].slice(1,2) --> returns 4, original array is [2,4,8]. the 2nd '1' is the 'EXCLUDING end index'
        this.items.splice(index, 1);
    }

    updateCount(id, newCount) {
        this.items.find(el => el.id === id).count = newCount; //So 'find' returns the element itself, 'findIndex' obviously returns the index
    }
}