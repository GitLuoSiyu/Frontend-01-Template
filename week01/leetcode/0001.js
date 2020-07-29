/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    let reverse = function (str) {
        var stack = [];
        for (var len = str.length, i = len; i >= 0; i--) {
            stack.push(str[i]);
        }
        return stack.join('');
    };
    console.log(reverse('I am a student'))
};