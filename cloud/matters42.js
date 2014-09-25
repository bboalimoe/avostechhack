var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var fs = require('fs');
var _ = require('underscore');
var AV = require('avoscloud-sdk').AV;

exports.getMatters42 = function() {
    AV.initialize("xv1cgfapsn90hyy2a42i9q6jg7phbfmdpt1404li6n93tt2r", "70sp4h8prccxzyfp56vwm9ksczji36bsrjvtwzvrzegfza67");
// 初始化 param1：应用 id、param2：应用 key
    var Product = AV.Object.extend("Product");

    var queryUrl = 'https://42matters.com/api/1/apps/top.json?listName=top_apps_local_weekly&category=0&country=CN&limit=100&access_token=290404e24df33dd14a8a4df72bbb078504642f09';
    request({url: queryUrl}, function (error, response, body) {
        console.log(error);
        console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
            console.log("successful get !");
            var toplist = JSON.parse(body);
            var promise = AV.Promise.as();
            var i = 0;
            _.each(toplist.appList, function (apiProduct) {
                promise = promise.then(function () {

                    var product = new Product();
                    var queryList = new AV.Query(Product);
                    queryList.equalTo("pid", apiProduct.package_name);
                    queryList.find().then(function (resProduct) {
                            var len = resProduct.length
                            console.log(len + "++" + (++i));
                            if (len == 0) {
                                product.save({source: "42matters.com", name: apiProduct.package_name, website: apiProduct.website, pid: apiProduct.package_name });
                            }
                            else if (len == 1) {
                                console.log("Exists!!")
                            }
                            else {
                                console.log("Error!!!!!!!!!!!!!!!!!!!Return Exists No:" + len);
                            }
                            return promise;

                        },
                        function (error) {
                            console.log(error);
                        }
                    );
                    return promise;
                    //   return product.save({source:1,name: apiProduct.package_name, website: apiProduct.website,pid:apiProduct.package_name });
                });
            });
            promise.then(function (results) {
                console.log('done!!');
            }, function (error) {
                console.log(error);
            });
        }
    });
}