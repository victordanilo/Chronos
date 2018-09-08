// -------------------- load dependencies gulp --------------------
var del          = require('del');
var each         = require('foreach');
var uikit        = require('./uikit_util');
var gulp         = require('gulp');
var rename       = require('gulp-rename');
var plumber      = require('gulp-plumber');
var babel        = require('gulp-babel');
var uglify       = require('gulp-uglify');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var prefixer     = require('gulp-autoprefixer');
var imagemin     = require('gulp-imagemin');
var environments = require('gulp-environments');
var browserSync  = require('browser-sync').create();


// -------------------- variables --------------------------------

// variables of environment
var pkg   = require('./package.json');
var bower = require('./bower.json');
var production  = environments.production;
var development = environments.development;

// base directories path
var path = 
{
    public: '../public',
    views:  '../application/views',
    tests:  './tests',
    src:    './src',
    vendor: './vendor',
    dist: function(){
        return development() ? this.tests : this.public;
    }
}

// assets path
var assets = 
{  
    img:    path.dist() + '/assets/img',
    css:    path.dist() + '/assets/css',
    js:     path.dist() + '/assets/js',
    fonts:  path.dist() + '/assets/fonts',
    vendor: path.dist() + '/assets/vendor'
}

// source path
var source = 
{
    html: {
        path:  path.src + '/html',
        files: path.src + '/html/**/*.html'
    },
    sass: {
        path:   path.src + '/sass',
        files:  path.src + '/sass/**/*.scss',
        core:   ['!'+path.src+'/sass/vendor/*.scss', '!'+path.src+'/sass/layouts/*.scss', path.src+'/sass/layouts/_base.scss', path.src+'/sass/**/*.scss'],
        pages:  [path.src + '/sass/layouts/*.scss'],
        vendor: [path.src + '/sass/vendor/*.scss']
    },
    js: {
        path:   path.src + '/js',
        files:  [path.src + '/js/**/*.js', '!' + path.src + '/js/vendor/*.js'],
        vendor: path.src + '/js/vendor/*.js'
    },
    img: {
        path:  path.src + '/img',
        files: path.src + '/img/**/*.{jpg,png,gif,svg,ico}'
    },
    fonts: {
        path:  path.src + '/fonts',
        files: path.src + '/fonts/*.{ttf,woff,eof,svg}'
    }
}


// -------------------- setting of environment --------------------------

// set environment for development
gulp.task('set-env-dev',function(done){
    environments.current(development);
    done();
});

// set environment for production
gulp.task('set-env-prod',function(done){
    environments.current(production);
    done();
});

// show current environment 
gulp.task('env-current',function(done){
    var status = production() ? 'production' : development() ? 'development' : undefined;
    console.log('current environment is ' + status);
    done();
});


// -------------------- clean directorys --------------------------

// clean up the image subdirectory of the assets directory
gulp.task('clean-img',function(done){
    var file = '/**';
    var not = '!';
    del.sync([assets.img+file, not+assets.img],{force:true});
    done();
});

// clean up the css subdirectory of the assets directory
gulp.task('clean-css',function(done){
    var file = '/**';
    var not = '!';
    del.sync([assets.css+file, not+assets.css],{force:true});
    done();
});

// clean up the js subdirectory of the assets directory
gulp.task('clean-js',function(done){
    var file = '/**';
    var not = '!';
    del.sync([assets.js+file, not+assets.js],{force:true});
    done();
});

// clean up the fonts subdirectory of the assets directory
gulp.task('clean-fonts',function(done){
    var file = '/**';
    var not = '!';
    del.sync([assets.fonts+file, not+assets.fonts],{force:true});
    done();
});

// clean up the vendor subdirectory of the assets directory
gulp.task('clean-vendor',function(done){
    var file = '/**';
    var not = '!';
    del.sync([assets.vendor+file, not+assets.vendor],{force:true});
    done();
});

// clean up the assets directory
gulp.task('clean-all', gulp.parallel('clean-img', 'clean-css', 'clean-js', 'clean-fonts', 'clean-vendor'));

// clean up the tests directory
gulp.task('clean-tests',function(done){
    var file = '/**';
    var not = '!';
    del.sync([path.tests+file, not+path.tests],{force:true});
    done();
});


// -------------------- build source ---------------------

// load views files 
gulp.task('views', function(){
    return gulp.src(source.html.files)
               .pipe(production(rename({extname: ".php"})))
               .pipe(production(gulp.dest(path.views)))
               .pipe(development(gulp.dest(path.tests)));
});

// compile sass files
gulp.task('compile-sass-core',function(){
    return gulp.src(source.sass.path + '/main.scss')
               .pipe(plumber())
               .pipe(development(sourcemaps.init()))
               .pipe(development(sass()))
               .pipe(production(sass({outputStyle:'compressed'})))
               .pipe(prefixer())
               .pipe(development(sourcemaps.write('.')))
               .pipe(rename({suffix:'.min'}))
               .pipe(gulp.dest(assets.css))
               .pipe(browserSync.stream());
});
gulp.task('compile-sass-pages',function(){
    return gulp.src(source.sass.pages)
               .pipe(plumber())
               .pipe(development(sourcemaps.init()))
               .pipe(development(sass()))
               .pipe(production(sass({outputStyle:'compressed'})))
               .pipe(prefixer())
               .pipe(development(sourcemaps.write('.')))
               .pipe(rename({suffix:'.min'}))
               .pipe(gulp.dest(assets.css))
               .pipe(browserSync.stream());
});
gulp.task('compile-sass', gulp.parallel('compile-sass-core','compile-sass-pages'));

// compile javascript files
gulp.task('compile-js',function(){
    return gulp.src(source.js.files)
               .pipe(plumber())
               .pipe(babel())
               .pipe(production(uglify()))
               .pipe(rename({suffix:'.min'}))
               .pipe(gulp.dest(assets.js))
               .pipe(browserSync.stream());
});

// optimizing and load images files
gulp.task('img', function(){
    return gulp.src([source.img.files, '!' + source.img.path + '/icons/**'])
               .pipe(imagemin())
               .pipe(gulp.dest(assets.img))
               .pipe(browserSync.stream());
});

// load fonts files 
gulp.task('fonts',function(){
    return gulp.src(source.fonts.files)
               .pipe(gulp.dest(assets.fonts))
               .pipe(browserSync.stream());
});

// watch the changes in source files
gulp.task('watch-source', function(){
    gulp.watch(source.html.files,  gulp.series('views'));
    gulp.watch(source.sass.core,   gulp.series('compile-sass-core'));
    gulp.watch(source.sass.pages,  gulp.series('compile-sass-pages'));
    gulp.watch(source.js.files,    gulp.series('compile-js'));
    gulp.watch(source.img.files,   gulp.series('img'));
    gulp.watch(source.fonts.files, gulp.series('fonts'));
});

// build all source files
gulp.task('build-source', gulp.parallel('views', 'compile-sass', 'compile-js', 'img', 'fonts'));


// -------------------- build dependencies -----------------------

// load the dependencies of the project
gulp.task('load-dependencies',function(done){
    var path_dependencies = {
        'uikit'        : '/uikit/dist/**/*.{min.css,min.js}',
        'jquery'       : '/jquery/dist/jquery.min.js',
        'jquery-ui'    : '/jquery-ui/{jquery-ui.min.js,themes/base/jquery-ui.min.css}',
        'mustache.js'  : '/mustache.js/mustache.min.js',
        'moment'       : '/moment/min/moment.min.js',
        'stopwatch'    : '/stopwatch/Stopwatch.min.js',
        'jquery-mask-plugin' : '/jquery-mask-plugin/dist/jquery.mask.min.js'
    };
    each(bower.dependencies,function(version,name){
        gulp.src(path.vendor + path_dependencies[name])
            .pipe(gulp.dest(assets.vendor +'/'+ name +'/'));
    });
    done();
});

// build custom uikit sass
gulp.task('build-custom-uikit-sass', function (){
    return gulp.src(source.sass.path + '/vendor/uikit.scss')
               .pipe(plumber())
               .pipe(development(sourcemaps.init()))
               .pipe(sass({outputStyle:'compressed', includePaths: ['./vendor/uikit/src/scss/components/']}))
               .pipe(prefixer())
               .pipe(development(sourcemaps.write('.')))
               .pipe(rename({suffix:'.min'}))
               .pipe(gulp.dest(assets.vendor + '/uikit/css'))
               .pipe(browserSync.stream());
});

// build custom uikit js
gulp.task('build-custom-uikit-js', function(done){
    uikit.compile('src/js/vendor/uikit.js', assets.vendor + '/uikit/js/uikit', {bundled: true});
    done();
});

// build custom uikit icons
gulp.task('build-custom-uikit-icons', function(done){
    uikit.compile('vendor/uikit/src/js/icons.js', assets.vendor + '/uikit/js/uikit-icons', {
        name: 'icons',
        replaces: {ICONS: uikit.icons('{vendor/uikit/src/images,src/img}/icons/*.svg')}
    });
    done();
});

// build custom uikit
gulp.task('build-custom-uikit', gulp.parallel('build-custom-uikit-sass', 'build-custom-uikit-js', 'build-custom-uikit-icons'));


// --------------------  hooks  -----------------------

// load data
gulp.task('load-data', function(){
    return gulp.src(path.src + '/data/**')
        .pipe(gulp.dest(path.tests + "/data/"));
});

// build app
gulp.task('build', gulp.series('load-dependencies','build-source','build-custom-uikit-icons'));

// set up a local testing server
gulp.task('server', gulp.series('clean-tests', 'set-env-dev', 'load-dependencies', 'build-source', 'build-custom-uikit-icons', 'load-data', function(){
    browserSync.init({
        server:{
            baseDir: path.tests
        }
    });

    gulp.watch(source.html.files,  gulp.parallel('views')).on('change',browserSync.reload);
    gulp.watch(source.sass.core,   gulp.parallel('compile-sass-core'));
    gulp.watch(source.sass.pages,  gulp.parallel('compile-sass-pages'));
    gulp.watch(source.js.files,    gulp.parallel('compile-js'));
    gulp.watch(source.img.files,   gulp.parallel('img'));
    gulp.watch(source.fonts.files, gulp.parallel('fonts'));
}));