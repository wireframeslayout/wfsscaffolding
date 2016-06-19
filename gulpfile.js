var gulp = require("gulp");
var sass = require("gulp-sass");
var uglify = require("gulp-uglify");
var browser = require("browser-sync");
var autoprefixer = require("gulp-autoprefixer");
var plumber = require("gulp-plumber");
var sourcemaps = require('gulp-sourcemaps');
var extender = require('gulp-html-extend');
var rimraf = require('gulp-rimraf');
var template = require('gulp-template-compile');
var concat = require('gulp-concat');
var ignore = require('gulp-ignore');
var webpack = require('gulp-webpack');
var compass = require('gulp-compass');
var _webpack = require('webpack');


var dist_root = "./dist";
var dev_root = "./dev";
var templateBase = "./templates";

//　自動更新
gulp.task("server", function() {
    browser({
        server: {
            baseDir: dist_root
        }
    });
});

// テンプレート
gulp.task('extend', function () {
    gulp.src([
        dev_root+'/**/*.html',
        '!' + dev_root+'/assets/js/**/*.html',
    ])
        //.pipe(plumber())
        .pipe(extender({annotations:true,verbose:false})) // default options
        .pipe(gulp.dest(dist_root))
        .pipe(browser.reload({stream:true}))
});

//htmlタスク
gulp.task('reload',function(){
    gulp.src(dev_root + '/**/*.html')          //実行するファイル
        //.pipe(plumber())
        //.pipe(gulp.dest("./*.html"))
        .pipe(browser.reload({stream:true}))
});

// sass compile
gulp.task("sass", function() {
    gulp.src(dev_root+"/assets/scss/**/*.scss")
        .pipe(compass({
            sass: dev_root + "/assets/scss",
            css: dist_root + "/assets/css",
            sourcemap: true,
            style: "compressed"

        }))
        .pipe(browser.reload({stream:true}))
});


// imgコピー
gulp.task('img', function () {
    gulp.src(dev_root+'/assets/img/**/*', {
            base: dev_root
        })
        .pipe(plumber())
        .pipe(gulp.dest(dist_root))
});

// テンプレート
gulp.task('js_template_extend', function () {
    gulp.src(dev_root+'/assets/js/templates/**/*.html')
        //.pipe(plumber())
        .pipe(extender({annotations:true,verbose:false})) // default options
        .pipe(gulp.dest(dev_root+'/assets/js/_templates'))
        .pipe(browser.reload({stream:true}))
});

// jsテンプレート
gulp.task('template', function () {
    gulp.src(dev_root + '/assets/js/templates/*.html')
        .pipe(template())
        .pipe(concat('templates.js'))
        //.pipe(uglify())
        .pipe(gulp.dest(dev_root + '/assets/js/'));
});

gulp.task('webpack', ['template'], function () {
    gulp.src(dev_root + '/assets/js/app.js')
        .pipe(webpack({
            entry: dev_root + '/assets/js/app.js',
            output: {
                filename: 'bundle.js'
            },
            devtool: "#source-map",
            plugins: [
                new _webpack.optimize.UglifyJsPlugin()
            ]
        }))
        //.pipe(uglify())
        .pipe(gulp.dest(dist_root + '/assets/js/'));
});

// jsコピー
gulp.task('js', ['webpack'], function () {
    gulp.src(
        [
            dev_root + '/assets/js/**/*',
            '!' + dev_root + '/assets/js/models/**/*',
            '!' + dev_root + '/assets/js/collections/**/*',
            '!' + dev_root + '/assets/js/views/**/*',
            '!' + dev_root + '/assets/js/templates/*.html',
            '!' + dev_root + '/assets/js/templates.js',
            '!' + dev_root + '/assets/js/app.js',
        ], {
            base: dev_root
        })
        .pipe(plumber())
        .pipe(ignore.include({isFile: true}))
        .pipe(gulp.dest(dist_root))
        .pipe(browser.reload({stream:true}))
});




// cssコピー
gulp.task('css', function () {
    gulp.src(dev_root+'/assets/css/**/*', {
            base: dev_root
        })
        .pipe(plumber())
        .pipe(gulp.dest(dist_root))
        .pipe(browser.reload({stream:true}))
});


// 展開前のファイル削除
gulp.task('build-init', function() {
    return gulp.src([dist_root,'!.gitkeep'], { read: false })
        .pipe(rimraf({ force: true }));
});

// ファイル展開
gulp.task("build",['build-init'],function(){
    gulp.run(['sass','extend','img','js','css']);
});

// gulp監視
gulp.task("default",['build','server'], function() {

    //scssファイルを監視
    gulp.watch(dev_root+'/assets/scss/**/*.scss',['sass']);
    //htmlファイルを展開
    gulp.watch([
        dev_root+'/**/*.html',
        templateBase+'/**/*.html',
        '!' + dev_root+'/assets/js/**/*.html'
    ], ['extend']);
    //htmlファイルを監視
    gulp.watch(dist_root+'/**/*.{html,css}',['reload']);
    //imgフォルダを監視
    gulp.watch(dev_root+'/assets/img/**/*',['img']);
    //jsフォルダを監視
    gulp.watch([
        dev_root+'/assets/js/**/*',
        '!' + dev_root+'/assets/js/templates.js',
        '!' + dev_root+'/assets/js/_templates/*'
    ],['js']);
    //cssフォルダを監視
    gulp.watch(dev_root+'/assets/css/**/*',['css']);


});

