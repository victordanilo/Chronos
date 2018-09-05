// load the gulp dependencies
var gulp = require('gulp');

// variables
var dist = '../public';
var src = './src';
var vendor = './vendor';

// assets path
var assets = 
{  
    img: dist + '/assets/img',
    css: dist + '/assets/css',
    js:  dist + '/assets/js',
    fonts: dist + '/assets/fonts',
    vendor: dist + '/assets/vendor'
}

// source path
var source = 
{   
    html: src + '/html',
    sass: src + '/sass',
    js: src + '/js',
    img: src + '/img',
    fonts: src + '/fonts'    
}
