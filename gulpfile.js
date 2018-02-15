var gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  path = require('path'),
  browserSync = require('browser-sync'),
  through2 = require('through2'),
  reload = browserSync.reload,
  browserify = require('browserify'),
  del = require('del'),
  argv = require('yargs').argv;

gulp.task('browser-sync', function () {
  browserSync({
    open: !!argv.open,
    notify: !!argv.notify,
    server: {
      baseDir: "./dist"
    }
  });
});

gulp.task('compass', function () {
  return gulp.src('src/stylesheets/*.css')
    .pipe(gulp.dest('dist/stylesheets'));
});
gulp.task('fonts', function () {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));
});


gulp.task('js', function () {
  return gulp.src('src/scripts/*.js')
    .pipe(gulp.dest('dist/scripts/'));
});


gulp.task('clean', function (cb) {
  del('./dist', cb);
});

gulp.task('images', function () {
  return gulp.src('./src/images/**/*')
    .pipe($.imagemin({
      progressive: true
    }))
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('templates', function () {
  return gulp.src('src/**/*.html')
    .pipe($.plumber())
    .pipe(gulp.dest('dist/'))
});


gulp.task('build', ['compass', 'js', 'templates', 'images', 'fonts']);

gulp.task('serve', ['build', 'browser-sync'], function () {
  gulp.watch('src/stylesheets/**/*.{scss,sass,css}', ['compass', reload]);
  gulp.watch('src/scripts/**/*.js', ['js', reload]);
  gulp.watch('src/images/**/*', ['images', reload]);
  gulp.watch('src/*.html', ['templates', reload]);
});

gulp.task('default', ['serve']);
