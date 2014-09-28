var request = require('request');
var async = require('async');
var _ = require('underscore');
var AV = require('avoscloud-sdk').AV;

exports.getWebsiteshot = function() {
    AV.initialize("xv1cgfapsn90hyy2a42i9q6jg7phbfmdpt1404li6n93tt2r", "70sp4h8prccxzyfp56vwm9ksczji36bsrjvtwzvrzegfza67");

    var TestProductDetail = AV.Object.extend("TestProductDetail");

    async.waterfall([
            function (callback) {
                var queryDetail = new AV.Query(TestProductDetail);
                queryDetail.notEqualTo("websiteshotFlag", 2)
                queryDetail.notEqualTo("website", "");
                queryDetail.limit(10);
                queryDetail.find({
                    success: function (results) {
                        console.log("Successfully get website url No:" + results.length);
                        var queryUrlList = [];
                        for (var i = 0; i < results.length; i++) {

                            var toQueryUrl = 'http://api.page2images.com/restfullink?p2i_url=' + results[i].get("website") + '&p2i_key=7a8161f602b66d3d&p2i_fullpage=1';
                            var item = {
                                productDetailResult: results[i],
                                queryUrl: toQueryUrl
                            };
                            queryUrlList.push(item);
}
                            callback(null, queryUrlList);
                        
                    }
                });
            }
            , function (queryUrlList, callback) {
                var i = 0;
                _.each(queryUrlList, function (oneQuery) {
                        async.waterfall([
                                function (callback) {
                                    //  console.log("productDetailResult:  "+ oneQuery);
                                    //   console.log("productDetailResult.website:  "+ oneQuery.website);
                                    request({url: oneQuery.queryUrl, timeout: 100000,
                                        headers: {
                                            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36 LBBROWSER'
                                        }}, function (error, response, body) {
                                        if (error) {
                                            console.log(error);
                                            console.log(response.statusCode);
                                            console.log(body);
                                            callback(null, 0, "", oneQuery.productDetailResult);

                                        }
                                        else if (!error && response.statusCode == 200) {
                                            var resBody = JSON.parse(body);
                                            if (resBody.status == "processing") {
                                                callback(null, 1, "", oneQuery.productDetailResult);
                                            }
                                            else if (resBody.status == "finished") {
                                                callback(null, 2, resBody.image_url, oneQuery.productDetailResult);
                                            }
                                            else {
                                                console.log("Error body.status:  " + resBody.status + "  " + oneQuery.queryUrl);
                                                callback(null, 0, "", oneQuery.productDetailResult);
                                            }

                                        }
                                        else {
                                            console.log("Error ResponseCode:  " + response.statusCode);
                                            callback(null, 0, "", oneQuery.productDetailResult);

                                        }
                                    });
                                }
                                , function (flag, image_url, productDetailResult, callback) {
                                    console.log("img_url's callback: " + flag + "   " + image_url + "   " + productDetailResult);
                                    if (flag == 1) {
                                        productDetailResult.set('websiteshotFlag', flag);
                                        productDetailResult.save().then(function () {
                                            callback(null);
                                        });
                                    }
                                    else if (flag == 2) {
                                        productDetailResult.set('websiteshotFlag', flag);
                                        productDetailResult.set('webpageShot', image_url);
                                        productDetailResult.save().then(function () {
                                            callback(null);

                                        });
                                    }
                                    else if (flag == 0) {
                                        console.log("Maybe Error Ocurred!!");
                                        callback(null);
                                    }

                                }]

                            , function (error) {
                                if (error)console.log(error);
                            });
                    }
                    , function (error) {
                        if (error)console.log(error);
                        callback(null);
                    });
            }]

        , function (error) {
            if (error)console.log(error);
        });

}









