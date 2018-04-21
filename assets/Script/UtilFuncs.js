
window.tm = window.tm || {};

tm.utils = {
    /**
     * 获取一个随机数
     * @param num
     * @returns {number}
     */
    getRandomInt: function (num) {
        return Math.floor(Math.random() * num)
    },

    /**
     * Randomly fetching a specified number of elements from an array
     * @param arr
     * @param count
     * @returns {Array}
     */
    randomArrayItems: function (arr, count = 1) {
        //
        let temArray = [];
        for (let index in arr) {
            temArray.push(arr[index]);
        }

        // Prevent cross-border
        count = Math.min(arr.length, count);

        // Get the arr index, save to this array
        let result = [];
        for (let i = 0; i < count; i++) {
            // generate a random index
            let arrIndex = Math.floor(Math.random() * temArray.length);
            // get the item of arrIndex
            result[i] = temArray[arrIndex];
            // delete the arrIndex from temArray
            temArray.splice(arrIndex, 1);
        }
        return result;
    }
};