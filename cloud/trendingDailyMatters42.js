
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');

exports.topTrendingDailyMatters42 = function() {
    var AV = require('avoscloud-sdk').AV;
    AV.initialize("xv1cgfapsn90hyy2a42i9q6jg7phbfmdpt1404li6n93tt2r", "70sp4h8prccxzyfp56vwm9ksczji36bsrjvtwzvrzegfza67");
// 初始化 param1：应用 id、param2：应用 key
    var Product = AV.Object.extend("Product");

    var queryUrl = 'https://42matters.com/api/1/apps/top.json?listName=top_apps_trending_daily&category=0&country=worldwide&limit=200&access_token=2f6c786535bad7de937af1f3332641a66c98596f';
    async.waterfall([

            function (callback) {
                request({url: queryUrl}, function (error, response, body) {
                    if (error) console.log(error);
                    console.log(response.statusCode);
                    if (!error && response.statusCode == 200) {
                        console.log("successful get !");
                        var topList = JSON.parse(body);
                        callback(null, topList);
                    }
                });
            }
            , function (topList, callback) {
                var i = 0;
                console.log(topList.appList.length);
                _.each(topList.appList, function (apiProduct) {
                    var product = new Product();
                    var queryList = new AV.Query(Product);
                    async.waterfall([
                            function (callback) {
                                queryList.equalTo("pid", apiProduct.package_name);
                                queryList.find().then(function (resProduct) {
                                    var len = resProduct.length;
                                    console.log(len + "++" + (++i));

                                    if (len == 1) {
                                        console.log("Exists!!");
                                    }
                                    else {
                                        console.log("Error!!!!!!!!!!!!!!!!!!!Return Exists No:" + len);
                                    }
                                    callback(null, len);
                                });
                            }
                            , function (len, callback) {
                                if (len == 0) {

                                    product.set("source", "42matters.com");
                                    product.set("name", apiProduct.title);
                                    product.set("website", apiProduct.website);
                                    product.set("pid", apiProduct.package_name);
                                    product.save().then(function () {
                                        callback(null);
                                    });

                                }
                                if (len == 1) {
                                    callback(null);
                                }
                                else {
                                    callback(null);
                                }

                            }]
                        , function (error) {
                            if (error) console.log(error);
                        });
                }, function (error) {
                    if (error) console.log(error);
                    callback(null);
                });
            }]
        , function (error) {
            if (error) console.log(error);
        });


}