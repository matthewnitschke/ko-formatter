var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var strip = require('gulp-strip-comments');

var pJson = require("./package.json");
var inject = require("gulp-inject-string");

gulp.task('scripts', function() {

    var versionNumber = pJson.version;

    gulp.src('src/ko-formatter.js')
        .pipe(rename('ko-formatter.min.js'))
        .pipe(uglify({ preserveComments: "license" }).on('error', gutil.log))
        .pipe(inject.replace("{{versionNumber}}", versionNumber))
        .pipe(gulp.dest('dist'));

    gulp.src('src/ko-formatter.js')
        .pipe(strip({ safe: true }))
        .pipe(inject.replace("{{versionNumber}}", versionNumber))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['scripts']);
