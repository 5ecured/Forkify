export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLike(id, title, author, img) { //Why these 4 parameters? Because that is all the info we want to display when we hover the 'heart'(like) button
        const like = {
            id,
            title,
            author,
            img
        }
        this.likes.push(like);

        // Persist data in localStorage. The logic is that anytime the likes array changes, we change the localStorage. Hence why its only in addLike and deleteLike - anytime
        // the likes array changes
        this.persistData();

        return like;
    }

    deleteLike(id) {
        const index = this.likes.findIndex(el => el.id === id); //See if the id of the item matches the id from the parameter
        //[2,4,8].splice(1,2) --> returns 4,8. original array is [2]. the 2nd '1' is 'how many elements we wanna take'
        //[2,4,8].slice(1,2) --> returns 4, original array is [2,4,8]. the 2nd '1' is the 'EXCLUDING end index'
        this.likes.splice(index, 1);

        // Persist data in localStorage. The logic is that anytime the likes array changes, we change the localStorage. Hence why its only in addLike and deleteLike - anytime
        // the likes array changes
        this.persistData();
    }

    isLiked(id) {
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    getNumLikes() {
        return this.likes.length;
    }

    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes)) //localStorage only deals with strings, so we use JSON stringify
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));

        //Restoring likes from localStorage. if storage exists in localStorage, we save it back to this.likes
        if(storage) this.likes = storage;
    }
}