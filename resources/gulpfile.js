// load the gulp dependencies
var del         = require('del');
var gulp        = require('gulp');
var rename      = require('gulp-rename');
var babel       = require('gulp-babel');
var uglify      = require('gulp-uglify');
var plumber     = require('gulp-plumber');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var prefixer    = require('gulp-autoprefixer');
var imagemin    = require('gulp-imagemin');

// base directories path
var dist   = '../public';
var views  = '../application/views';
var src    = './src';
var vendor = './vendor';

// assets path
var assets = 
{  
    img:    dist + '/assets/img',
    css:    dist + '/assets/css',
    js:     dist + '/assets/js',
    fonts:  dist + '/assets/fonts',
    vendor: dist + '/assets/vendor'
}

// source path
var source = 
{   
    html:  src + '/html/**/*.html',
    sass:  src + '/sass/**/*.scss',
    js:    src + '/js/**/*.js',
    img:   src + '/img/**/*.{jpg,png,gif,svg}',
    fonts: src + '/fonts/*.{ttf,woff,eof,svg}'
}


// cleanup the image subdirectory of the assets directory
gulp.task('clean-img',function(done){
    var file = '/**';
    var not = '!';
    del.sync([assets.img+file, not+assets.img],{force:true});
    done();
});

// cleanup the css subdirectory of the assets directory
gulp.task('clean-css',function(done){
    var file = '/**';
    var not = '!';
    del.sync([assets.css+file, not+assets.css],{force:true});
    done();
});

// cleanup the js subdirectory of the assets directory
gulp.task('clean-js',function(done){
    var file = '/**';
    var not = '!';
    del.sync([assets.js+file, not+assets.js],{force:true});
    done();
});

// cleanup the fonts subdirectory of the assets directory
gulp.task('clean-fonts',function(done){
    var file = '/**';
    var not = '!';
    del.sync([assets.fonts+file, not+assets.fonts],{force:true});
    done();
});

// cleanup the vendor subdirectory of the assets directory
gulp.task('clean-vendor',function(done){
    var file = '/**';
    var not = '!';
    del.sync([assets.vendor+file, not+assets.vendor],{force:true});
    done();
});

// cleanup the assets directory
gulp.task('clean-all', gulp.parallel('clean-img', 'clean-css', 'clean-js', 'clean-fonts', 'clean-vendor'));


// load views files 
gulp.task('views', function(){
    return gulp.src(source.html)
               .pipe(rename({extname: ".php"}))
               .pipe(gulp.dest(views));
});

// compile sass files
gulp.task('compile-sass',function(){
    return gulp.src(source.sass)
               .pipe(plumber())
               .pipe(sourcemaps.init())
               .pipe(sass())
               .pipe(sass({outputStyle:'compressed'}))
               .pipe(prefixer({browsers: ['> 1%', 'last 2 versions', 'firefox >= 4', 'safari 7', 'safari 8', 'IE 8', 'IE 9', 'IE 10', 'IE 11']}))
               .pipe(sourcemaps.write('.'))
               .pipe(rename({basename:'style'}))
               .pipe(gulp.dest(assets.css));
});

// compile javascript files
gulp.task('compile-js',function(){
    return gulp.src(source.js)
               .pipe(plumber())
               .pipe(babel())
               .pipe(uglify())
               .pipe(gulp.dest(assets.js));
});

// optimizing and load images files
gulp.task('img', function(){
    return gulp.src(source.img)
               .pipe(imagemin())
               .pipe(gulp.dest(assets.img));
});

// load fonts files 
gulp.task('fonts',function(){
    return gulp.src(source.fonts)
               .pipe(gulp.dest(assets.fonts));
});

// watch the changes in source files
gulp.task('watch-source', function(){
    gulp.watch(source.html, gulp.series('views'));
    gulp.watch(source.sass, gulp.series('compile-sass'));
    gulp.watch(source.js, gulp.series('compile-js'));
    gulp.watch(source.img, gulp.series('img'));
    gulp.watch(source.fonts, gulp.series('fonts'));
});

// build all source files
gulp.task('build-source', gulp.parallel('views', 'compile-sass', 'compile-js', 'img', 'fonts'));