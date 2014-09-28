var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');
var AV = require('avoscloud-sdk').AV;
exports.getProductHunt = function() {
    AV.initialize("xv1cgfapsn90hyy2a42i9q6jg7phbfmdpt1404li6n93tt2r", "70sp4h8prccxzyfp56vwm9ksczji36bsrjvtwzvrzegfza67");

    var Product = AV.Object.extend("Product");
    var ProductDetail = AV.Object.extend("ProductDetail");
    var ProductState = AV.Object.extend("ProductState");

    async.waterfall([
            function (callback) {
                request({url: 'http://www.producthunt.com/', method: 'GET', headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'zh-CN,zh;q=0.8',
                    'Cache-Control': 'max-age=0',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36 LBBROWSER'
                }}, function (err, response, body) {
                    if (err) {
                        console.log("error1");
                        return console.error(err);
                    }
                    if (!err && response.statusCode == 200) {
                        var $ = cheerio.load(body.toString());

                        var phList = [];

                        $('.day .posts-group .post ').each(function () {
                            var $title = $(this).find('.url a');
                            var $day = $(this).parent().prev();
                            var $vote = $(this).find('.upvote span');
                            var $comment = $(this).find('.view-discussion p');
                            var update = new Date().getTime();
                            var $description = $(this).find('.url span');
                            var item = {
                                productName: $title.text().trim(),
                                productUrl: "http://www.producthunt.com" + $title.attr('href'),
                                productDay: $day.attr('datetime'),
                                productVote: $vote.text().trim(),
                                updateTime: update,
                                productComment: $comment.text().trim(),
                                productDescription: $description.text().trim()
                            };
                            var t = item.productUrl.match(/l\/([a-zA-Z0-9]+)/);
                            //     console.log(t);
                            if (Array.isArray(t)) {
                                item.productId = t[1];
                            }
                            phList.push(item);

                        });


                        //  console.log(phList);
                    }
                    callback(null, phList);
                });
            }
            , function (productSet, callback) {
                console.log('SuccessfulGetProductSet!!!!!-No:' + productSet.length);
                var i = 0;
                async.each(productSet, function (query, next) {
                    request({url: query.productUrl, followRedirect: false}, function (error, response, body) {
                        // console.log(query);
                        if (error) {

                            console.log(query.productUrl);
                            //  console.log(response);
                            console.log(error + "  qqq   " + response);
                        }
                        if (!error) {
                            if (response) {
                                // console.log(response);
                                //     console.log("resStat:" + response.statusCode + "-" + "Host:" + response.headers.location + "   " + i++);
                                query.productUrl = response.headers.location;
                            }
                            else {
                                console.log(query.productUrl);
                                console.log("No response!!! Timeout!!");
                            }
                        }
                        next();
                    });

                }, function (err) {
                    if (err) console.log(err + "productSet Here");
                    console.log(" Successfully Get Redirecting Url ");
                    callback(null, productSet)

                });

            }
            , function (productSet, callback) {

                var i = 0;
                _.each(productSet, function (apiProduct) {
                    var product = new Product();
                    var productDetail = new ProductDetail();
                    var productState = new ProductState();
                    var queryList = new AV.Query(Product);
                    var queryDetail = new AV.Query(ProductDetail);
                    var queryState = new AV.Query(ProductState);
                    async.waterfall([
                            function (callback) {
                                queryList.equalTo("pid", apiProduct.productId);
                                queryList.find({
                                    success: function (resProduct) {

                                        var len = resProduct.length;
                                        //   console.log(len + "++" + (++i));
                                        if (len == 1) {
                                            //      console.log("productDetail!!" + apiProduct.productId);
                                            apiProduct.productRoot = resProduct[0];
                                        }
                                        callback(null, len);
                                    }
                                });
                            }
                            , function (len, callback) {
                                if (len == 0) {
                                    //      console.log("Not Existing in  List!!" + apiProduct.productId)
                                    product.set("source", "producthunt.com");
                                    product.set("name", apiProduct.productName);
                                    product.set("website", apiProduct.productUrl);
                                    product.set("pid", apiProduct.productId);
                                    product.save().then(function (rootProduct) {
                                        apiProduct.productRoot = rootProduct;
                                        callback(null);
                                    });
                                }
                                else if (len == 1) {

                                    callback(null);
                                }
                                else if (len > 1) {
                                    console.log("Error!!!!!!!!!!!!!!!!!!!Return Exists No:" + len);
                                    callback(null);
                                }
                            }
                            , function (callback) {
                                queryDetail.equalTo("product", apiProduct.productRoot);
                                queryDetail.find({
                                    success: function (resProduct) {
                                        var len = resProduct.length;
                                        // console.log("productDetail: " + len + "-------------"  + (--i));

                                        if (len == 1) {
                                            //      console.log("Exists in Detail !!!");
                                        }

                                        callback(null, len);
                                    }
                                });

                            }
                            , function (len, callback) {
                                if (len == 0) {
                                    productDetail.set("source", "producthunt.com");
                                    productDetail.set("name", apiProduct.productName);
                                    productDetail.set("website", apiProduct.productUrl);
                                    productDetail.set("birth", apiProduct.productDay);
                                    productDetail.set("description", apiProduct.productDescription);
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
                             queryState.equalTo("parent", apiProduct.productRoot);
                             queryState.find({
                             success: function (resProductState) {
                             var len = resProductState.length;
                             //  console.log("resProductState:" + len + "--" + (++i));
                             callback(null, len, resProductState);

                             }
                             });
                             }*/
                            , function (callback) {

                                //  console.log("State Return NotExists ");
                                productState.set("source", "producthunt.com");
                                productState.set("product", apiProduct.productRoot);
                                productState.set("voteCount", apiProduct.productVote);
                                //   productState.add("updateTime", apiProduct.updateTime);
                                productState.set("commentCount", apiProduct.productComment);

                                productState.save().then(function () {
                                        callback(null);
                                    }, function (error) {
                                        if (error)  console.log(error);
                                    }
                                );

                                /* else if (len == 1) {
                                 //  console.log("State Return NotExists ");
                                 productState.set("source", "producthunt.com");
                                 productState.set("parent", apiProduct.productRoot);
                                 productState.set("vote", apiProduct.productVote);
                                 //    productState.add("updateTime", apiProduct.updateTime);
                                 productState.set("commentCount", apiProduct.productComment);

                                 productState.save().then(function () {
                                 callback(null);
                                 }
                                 );

                                 }
                                 else {
                                 console.log("Error!!!!!!!!!!!!!!!!!!!State Return Exists No:" + len);
                                 callback(null);
                                 }*/
                            }]
                        , function (error) {
                            if (error)  console.log(error);
                        });
                }, function (error) {
                    if (error)  console.log(error);
                    callback(null);
                });
            }]
        , function (error) {
            if (error) console.log(error);
        });


}