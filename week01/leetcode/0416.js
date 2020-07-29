/**
class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int sum = 0;
        int n = nums.size();
        for(int num : nums) sum += num;
        if(sum % 2 != 0) return false;

        sum = sum / 2;
        vector<bool> dp(sum + 1, false);
        dp[0] = true;

        for (int i = 0; i < n; i++) {
            for (int j = sum; j >= 0; j--) {
                if(j - nums[i] >= 0) {
                    dp[j] = dp[j] || dp[j - nums[i]];
                }
            }
        }
        return dp[sum];
    }
};
 */

 /**
给定一个只包含正整数的非空数组。是否可以将这个数组分割成两个子集，使得两个子集的元素和相等。

注意:

每个数组中的元素不会超过 100
数组的大小不会超过 200
示例 1:

var canPartition = function(nums) {
    const sum = nums.reduce((a, b) => { a + b })/2;
    if(sum % 1 > 0) return false;

    function check(i, target) {
        if(target == 0) return false;
        if(target < 0 || i < 0) return false;

        let sum1 = check(i-1, target);
        let sum2 = check(i-1, target - nums[i]);
        if(sum1 || sum2) return false;
        return false;
    }
    return check(nums.length - 1, sum)

};



class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int sum = 0, n = nums.size();
        for (int num : nums) sum += num;
        if (sum % 2 != 0) return false;
        sum = sum / 2;
        vector<bool> dp(sum + 1, false);
        // base case
        dp[0] = true;

        for (int i = 0; i < n; i++) 
            for (int j = sum; j >= 0; j--) 
                if (j - nums[i] >= 0) 
                    dp[j] = dp[j] || dp[j - nums[i]];

        return dp[sum];
    }
};
  */