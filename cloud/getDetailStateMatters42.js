var request = require('request');
var async = require('async');
var _ = require('underscore');
var AV = require('avoscloud-sdk').AV;

exports.getDetailsStateMatters42 = function() {

    AV.initialize("xv1cgfapsn90hyy2a42i9q6jg7phbfmdpt1404li6n93tt2r", "70sp4h8prccxzyfp56vwm9ksczji36bsrjvtwzvrzegfza67");

    var Product = AV.Object.extend("Product");
    var ProductDetail = AV.Object.extend("ProductDetail");
    var ProductState = AV.Object.extend("ProductState");
    var queryList = new AV.Query(Product);
    var queryDetail = new AV.Query(ProductDetail);
    var queryState = new AV.Query(ProductState);

    async.waterfall([
            function (callback) {

                queryList.equalTo("source", "42matters.com");
                queryList.limit(500);
                queryList.find({
                    success: function (results) {
                        var queryUrlList = [];
                        for (var i = 0; i < results.length; i++) {
                            var queryUrl = 'https://42matters.com/api/1/apps/lookup.json?&access_token=2f6c786535bad7de937af1f3332641a66c98596f&p=';
                            queryUrl = queryUrl + results[i].get('pid');
                            var item = {
                                productUrl: queryUrl,
                                productRoot: results[i],
                                productDeta: null
                            };
                            queryUrlList.push(item);


                        }
                        //    console.log(queryUrlList);
                        callback(null, queryUrlList);
                    }
                });
            }
            , function (queryUrlList, callback) {
                console.log('SuccessfulGetQueryList!!!!!-No:' + queryUrlList.length);
                var i = 0;
                async.each(queryUrlList, function (query, next) {
                        async.series([
                                function (callback) {
                                    request({url: query.productUrl}, function (error, response, body) {
                                        if (error) {
                                            console.log(error + "   failed to get the detail:  " + query.productUrl + "-" + i++);

                                        }

                                        //   if (!error && response.statusCode == 200) {
                                        if (!error) {
                                            if (response.statusCode != 200) {
                                                console.log(response.statusCode);
                                            }
                                            var proRes = JSON.parse(body);
                                            query.productDeta = proRes;

                                        }

                                        callback(null);
                                    });

                                }
                                , function (callback) {
                                    var startTime = new Date().getTime(); //当前时间的毫秒数
                                    while (new Date().getTime() < startTime + 500);
                                    callback(null);

                                }]
                            , function (err) {
                                if (err) console.log(err);
                                next();
                            });
                    }
                    , function (err) {
                        if (err) console.log(err);
                        callback(null, queryUrlList)
                    });

            }
            , function (queryUrlList, callback) {
                console.log("Successful Get the queryUrlList NO.:" + queryUrlList.length);
                var i = 0;
                _.each(queryUrlList, function (apiProduct) {
                        var productDetail = new ProductDetail();
                        var productState = new ProductState();
                        async.waterfall([
                                function (callback) {

                                    queryDetail.equalTo("product", apiProduct.productRoot);
                                    queryDetail.find().then(function (resProduct) {

                                        var len = resProduct.length
                                        console.log(len + "--" + (++i));

                                        if (len == 1) {
                                            console.log(" Detail Existing!!!!!")

                                        }
                                        else if (len > 1) {
                                            console.log("Error!!!!!!!!!!!!!!!!!!!Return Exists No:" + len);
                                        }
                                        callback(null, len);

                                    });
                                }
                                , function (len, callback) {
                                    if (len == 0) {
                                        productDetail.set("source", "42matters.com");
                                        productDetail.set("raw_data", apiProduct.productDeta);    //
                                        productDetail.set("market_update", apiProduct.productDeta.market_update);  //
                                        productDetail.set("price_numeric", apiProduct.productDeta.price_numeric);
                                        productDetail.set("price_currency", apiProduct.productDeta.price_currency);
                                        productDetail.set("icon", apiProduct.productDeta.icon);
                                        productDetail.set("package_name", apiProduct.productDeta.package_name);
                                        productDetail.set("iap", apiProduct.productDeta.price_numeric);
                                        productDetail.set("price_numeric", apiProduct.productDeta.iap);
                                        productDetail.set("title", apiProduct.productDeta.title);
                                        productDetail.set("version", apiProduct.productDeta.version);             //
                                        productDetail.set("downloads", apiProduct.productDeta.market_url);
                                        productDetail.set("size", apiProduct.productDeta.size);                   //
                                        productDetail.set("deep_link", apiProduct.productDeta.deep_link);
                                        productDetail.set("cat_type", apiProduct.productDeta.cat_type);
                                        productDetail.set("created", apiProduct.productDeta.created);
                                        productDetail.set("cat_int", apiProduct.productDeta.cat_int);
                                        productDetail.set("promo_video", apiProduct.productDeta.promo_video);
                                        productDetail.set("screenshots", apiProduct.productDeta.screenshots);
                                        productDetail.set("developer", apiProduct.productDeta.developer);
                                        productDetail.set("content_rating", apiProduct.productDeta.content_rating);
                                        productDetail.set("price", apiProduct.productDeta.price);
                                        productDetail.set("website", apiProduct.productDeta.website);
                                        productDetail.set("description", apiProduct.productDeta.description);
                                        productDetail.set("category", apiProduct.productDeta.category);
                                        productDetail.set("product", apiProduct.productRoot);
                                        productDetail.save().then(function () {
                                            callback(null);
                                        });

                                    }

                                    else if (len == 1) {

                                        callback(null);
                                    }
                                    else if (len > 1) {
                                        callback(null);

                                    }

                                }
                                /*, function (callback) {

                                 queryState.equalTo("product", apiProduct.productRoot);
                                 queryState.find({

                                 success: function (resProductState) {
                                 var len = resProductState.length;
                                 console.log(len + "--State.length--" + (++i));
                                 callback(null,len,resProductState);
                                 }
                                 });


                                 }*/
                                , function (callback) {
                                    // var updateTime = new Date().getTime();

                                    console.log("State Return NotExists ");
                                    productState.set("source", "42matters.com");
                                    productState.set("number_ratings", apiProduct.productDeta.number_ratings);
                                    productState.set("rating", apiProduct.productDeta.rating);
                                    //  productState.add("updateTime", updateTime);
                                    productState.set("product", apiProduct.productRoot);
                                    productState.save().then(function () {
                                        callback(null);
                                    });

                                }]
                            , function (err) {
                                if (err) console.log(err);
                            });
                    }
                    , function (err) {
                        if (err) console.log(err);
                        callback(null);
                    });
            }]
        , function (err) {
            if (err) console.log(err);
        });
}