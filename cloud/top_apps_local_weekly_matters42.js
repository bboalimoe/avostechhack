var request = require('request');
var async = require('async');
var _ = require('underscore');
var AV = require('avoscloud-sdk').AV;

exports.get_top_apps_local_weekly_matters42 = function() {
    AV.initialize("xv1cgfapsn90hyy2a42i9q6jg7phbfmdpt1404li6n93tt2r", "70sp4h8prccxzyfp56vwm9ksczji36bsrjvtwzvrzegfza67");
// 初始化 param1：应用 id、param2：应用 key

    var Product = AV.Object.extend("Product");
    var queryUrl = 'https://42matters.com/api/1/apps/top.json?listName=top_apps_local_weekly&category=0&country=CN&limit=100&access_token=89eeb89fa2612ed63164eadd9727b04dfb81030e';
    async.waterfall([
        function (callback) {
            request({url: queryUrl}, function (error, response, body) {
                if (error) {
                    console.log(error);
                    console.log(response.statusCode);
                }

                if (!error && response.statusCode == 200) {
                    //  console.log("successful get !");
                    var toplist = JSON.parse(body);
                    callback(null, toplist);
                }

            });
        }
        , function (toplist, callback) {

            var i = 0;
            _.each(toplist.appList, function (apiProduct) {
                var product = new Product();
                var queryList = new AV.Query(Product);
                async.waterfall([
                        function (callback) {

                            queryList.equalTo("pid", apiProduct.package_name);
                            queryList.find().then(function (resProduct) {
                                var len = resProduct.length
                                //    console.log(len + "++" + (++i));
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

                            else if (len == 1) {

                                callback(null);
                            }
                            else {
                                console.log("Error!!!!!!!!!!!!!!!!!!!Return Exists No:" + len);
                                callback(null);
                            }
                        }]
                    , function (error) {
                        if (error)   console.log(error);
                    });
            }, function (error) {
                if (error)   console.log(error);
                callback(null);
            });
        }], function (error) {
        if (error)   console.log(error);
    });

}