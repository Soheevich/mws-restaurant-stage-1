const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
// const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const mergeStream = require('merge-stream');
const browserSync = require('browser-sync');

const server = browserSync.create();


gulp.task('copy', () => mergeStream(
  gulp.src('src/images/**/*').pipe(gulp.dest('build/images/')),
  gulp.src('src/data/*.json').pipe(gulp.dest('build/data/')),
));

gulp.task('copy-html', () =>
  mergeStream(gulp.src('*.html').pipe(gulp.dest('build/'))));

// Compile JS
gulp.task('compress', () =>
  gulp
    .src('src/js/*.js', { sourcemaps: true })
    .pipe(babel({ presets: ['env'] }))
    // .pipe(uglify({ output: { quote_style: 1 } }))
    .pipe(rename({ suffix: '-min' }))
    .pipe(gulp.dest('build/js'))
    .pipe(server.stream()));

// Compile Sass
gulp.task('sass', () =>
  gulp
    .src(['src/scss/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/styles'))
    .pipe(server.stream()));

// Watch
gulp.task('serve', ['sass', 'compress', 'copy-html', 'copy'], () => {
  browserSync.init({
    server: './build',
  });

  gulp.watch(['src/scss/*.scss'], ['sass']);
  gulp.watch(['src/scripts/*.js'], ['compress']);
  gulp.watch(['*.html'], ['copy-html']);
  gulp.watch(['src/images/**/*', 'src/data/*.json'], ['copy']);
  gulp.watch(['build/*.html']).on('change', server.reload);
});

// Default
gulp.task('default', ['serve']);
