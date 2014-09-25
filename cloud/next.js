var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('underscore');
var AV = require('avoscloud-sdk').AV;

exports.getNext = function() {
    AV.initialize("xv1cgfapsn90hyy2a42i9q6jg7phbfmdpt1404li6n93tt2r", "70sp4h8prccxzyfp56vwm9ksczji36bsrjvtwzvrzegfza67");

    var Product = AV.Object.extend("Product");
    var ProductDetail = AV.Object.extend("ProductDetail");
    var ProductState = AV.Object.extend("ProductState");

    async.waterfall([
            function (callback) {
                var nextList = [];
                request({url: 'http://next.36kr.com/posts', method: 'GET', headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'zh-CN,zh;q=0.8',
                    'Cache-Control': 'max-age=0',
                    'Cookie': '__utma=47937701.532388177.1410687140.1410687140.1410691951.2; __utmz=47937701.1410687140.1.1.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); i_understood_the_rule=yes; sign_in_qrcode_token=7bab7793906b641db5e6094b63a6f97acac889b1b74317228472e531ab24b324; _krypton_rs_session=MUZpRkRNYTNQYnZqUHlLeDZlV0xBUWQ5SndOMERYOUlyK2VZTkp6WXA3Y0R4d1ByY1ExTTcwRDhvRjd2dTVTb01rck5QUGNLSEVIK2NUSE1ubUgrRnRJYSs3aE9kN2tUTTg2cFJmTWFsdE5BZG9tMlRZdGluWVp1NEpaMzYvdVI5OG54c2syTzFPYVpuL2FadmxJZWwxTFZaUUY1Q1JPQk9DbElHeDluR0tVbFhmZzRhb2MydHk4bSs2TWhqaXFoVW5MUHFPRmZhMDF6MTJFeUUzbGhPTVdOQ1RoREswUmpocDFZTndYY2NPdXRwYWRYd0FGNHNhYlpMWEwraVFGNGk1V09QckdUbjh6WTNZSU5JM0xVVDBrcmxwS29KUisyVEloOGhpeVNUNURveG1acUFsRjBnbkcwVTlrMW4rMk8tLWpSRG1Uc3JKNXFGTitFYm9JcHNPOGc9PQ%3D%3D--0264b8b20147f64833e914bd5752fe82c63621c2; _ga=GA1.2.532388177.1410687140',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36 LBBROWSER'
                }}, function (err, response, body) {
                    if (err) {
                        return console.error(err);
                    }
                    if (!err && response.statusCode == 200) {
                        var $ = cheerio.load(body.toString());
                        var nextList = [];
                        $('.post .post-wrapper').each(function () {

                            var $title = $(this).find('.product-url a');
                            var $vote = $(this).find('.upvote span');
                            var update = new Date().getTime();
                            var $day = $(this).parent().find('.date small');
                            var $comment = $(this).find('.product-url .post-actions a');
                            var $description = $(this).find('.product-url .post-tagline');
                            var item = {
                                productName: $title.text().trim(),
                                productUrl: "http://next.36kr.com" + $title.attr('href'),
                                productDay: $day.text().trim(),
                                productVote: $vote.text().trim(),
                                updateTime: update,
                                productComment: $comment.text().trim(),
                                productDescription: $description.text().trim(),
                                productRoot: null
                            };

                            var s = item.productName.match(/[ \+\w\t\.\u4e00-\u9fa5\u0370-\u03ff:]+/);
                            var t = item.productUrl.match(/posts\/([0-9]+)\/hit/);
                            var d = item.productDay.match(/[0-9]{1,2}/g);
                            var c = item.productComment.match(/[0-9]+/);

                            if (Array.isArray(s)) {
                                item.productName = s[0];
                            }
                            if (Array.isArray(t)) {
                                item.productId = t[1];

                            }
                            if (Array.isArray(d)) {
                                if (parseInt(d[0]) < 10)
                                    item.productDay = new Date().getFullYear() + '-0' + d[0] + '-' + d[1];
                                else
                                    item.productDay = new Date().getFullYear() + '-' + d[0] + '-' + d[1];
                            }
                            if (Array.isArray(c)) {
                                item.productComment = c[0];

                            }
                            else {
                                item.productComment = "0";
                            }


                            nextList.push(item);

                        });
                        callback(null, nextList);

                    }
                });

            }
            , function (productSet, callback) {
                console.log('SuccessfulGetProductSet!!!!!-No:' + productSet.length);
                var i = 0;
                async.each(productSet, function (query, next) {

                    request({url: query.productUrl, timeout: 7000}, function (error, response, body) {
                        // console.log(query);
                        if (error) {
                            console.log(query.productUrl);
                            console.log(error + "  fail to  Fetch Redirected Url    ");
                            next();
                        }
                        if (!error) {
                            if (response) {

                                var uriHref = response.request.uri.href.match(/(.*)[&?\??]utm_source=next\.36kr\.com/);
                                if (Array.isArray(uriHref)) {
                                    query.productUrl = uriHref[1];
                                }

                            }

                            else {
                                console.log(query.productUrl);
                                console.log("No response!!! Timeout!!");
                            }

                            next();
                        }

                    });

                }, function (err) {
                    if (err) console.log(err + "productSet Here");
                    console.log(" Successfully Get all Redirecting Urls ");
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
                                        //  console.log("List " + len + " ++ " + (++i));
                                        if (len == 1) {
                                            console.log("Existing in List!!" + apiProduct.productId);
                                            //   console.log(resProduct[0]);
                                            apiProduct.productRoot = resProduct[0];
                                            //    console.log(apiProduct.productRoot);
                                            //  console.log("uuuuuuuuuuuuuuuuuu");

                                        }

                                        callback(null, len);
                                    }
                                });
                            }
                            , function (len, callback) {

                                if (len == 0) {
                                    console.log("Not Existing in  List!!" + apiProduct.productId)

                                    product.set("source", "next.36kr.com");
                                    product.set("name", apiProduct.productName);
                                    product.set("website", apiProduct.productUrl);
                                    product.set("pid", apiProduct.productId);

                                    product.save().then(function (rootProduct) {
                                        apiProduct.productRoot = rootProduct;
                                        //   console.log("kkk");
                                        //  console.log(apiProduct.productRoot);
                                        //   console.log("hhh");
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

                                // console.log(apiProduct);

                                queryDetail.equalTo("root", apiProduct.productRoot);
                                queryDetail.find({
                                    success: function (resProduct) {
                                        var len = resProduct.length;
                                        console.log("productDetail: " + len + "-------------" + apiProduct.productRoot.id + "-------------------------" + (--i));

                                        if (len == 1) {
                                            console.log("Exists in Detail !!!");

                                        }
                                        else if (len > 1) {
                                            console.log("Error!!!!!!!!!!!!!!!!!!!Detail Return Exists No:" + len);

                                        }
                                        callback(null, len);
                                    }
                                });
                            }
                            , function (len, callback) {
                                if (len == 0) {

                                    productDetail.set("source", "next.36kr.com");
                                    productDetail.set("name", apiProduct.productName);
                                    productDetail.set("website", apiProduct.productUrl);
                                    //  productDetail.set("pid", apiProduct.productId);
                                    productDetail.set("birth", apiProduct.productDay);
                                    productDetail.set("description", apiProduct.productDescription);
                                    productDetail.set("root", apiProduct.productRoot);
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
                            , function (callback) {
                                queryState.equalTo("root", apiProduct.productRoot);
                                queryState.find({
                                    success: function (resProductState) {
                                        var len = resProductState.length;
                                        console.log("resProductState:" + len + "--" + (++i));
                                        callback(null, len, resProductState);

                                    }
                                });
                            }
                            , function (len, resProductState, callback) {
                                if (len == 0) {
                                    //  console.log("State Return NotExists ");
                                    productState.set("source", "next.36kr.com");
                                    productState.set("root", apiProduct.productRoot);
                                    //   productState.set("pid", apiProduct.productId);
                                    productState.add("vote", apiProduct.productVote);
                                    productState.add("updateTime", apiProduct.updateTime);
                                    productState.add("commentCount", apiProduct.productComment);

                                    productState.save().then(function () {
                                            callback(null);
                                        }
                                    );
                                }
                                else if (len == 1) {
                                    console.log("Existing in State !!   " + len + "--" + (++i))
                                    resProductState[0].add("vote", apiProduct.productVote);
                                    resProductState[0].add("updateTime", apiProduct.updateTime);
                                    resProductState[0].add("commentCount", apiProduct.productComment);
                                    resProductState[0].save().then(function () {
                                        callback(null);
                                    });
                                }
                                else {
                                    console.log("Error!!!!!!!!!!!!!!!!!!!State Return Exists No:" + len);
                                    callback(null);
                                }
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