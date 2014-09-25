// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
var matters42 = require('cloud/matters42.js');
var rMatters42 = require('cloud/rMatters42.js');
var tNext = require('cloud/next.js');
var ph = require('cloud/ph.js');
AV.Cloud.define("avosMatters42", function(request, response) {
    matters42.getMatters42();
});
AV.Cloud.define("avosRMatters42", function(request, response) {
    rMatters42.getMDS();
});
AV.Cloud.define("avosNext",function(request,response){
    tNext.getNext();
});
AV.Cloud.define("avosPh",function(request,response){
    ph.getPH();
});