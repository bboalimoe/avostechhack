// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
var localWeeklyMatters42 = require('cloud/localWeeklyMatters42.js');
var trendingDailyMatters42 = require('cloud/trendingDailyMatters42.js');
var getDetailStateMatters42 = require('cloud/getDetailStateMatters42.js');
var getWebsiteshot = require('cloud/getWebsiteshot.js');
var getNext = require('cloud/next.js');
var getProductHunt = require('cloud/ph.js');
AV.Cloud.define("avosTopLocalWeeklyMatters42", function(request, response) {
    localWeeklyMatters42.topLocalWeeklyMatters42();
});
AV.Cloud.define("avosTopTrendingDailyMatters42", function(request, response) {
    trendingDailyMatters42.topTrendingDailyMatters42();
});
AV.Cloud.define("avosGetDetailsStateMatters42",function(request,response){
    getDetailStateMatters42.getDetailsStateMatters42();
});
AV.Cloud.define("avosGetWebsiteshot",function(request,response){
    getWebsiteshot.getWebsiteshot();
});

AV.Cloud.define("avosGetNext36Kr",function(request,response){
    getNext.getNext36Kr();
});

AV.Cloud.define("avosGetProductHunt",function(request,response){
    getProductHunt.getProductHunt();
});