const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const pump = require('pump');
// const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const mergeStream = require('merge-stream');


gulp.task('copy', () => mergeStream(
  gulp.src('src/images/**/*').pipe(gulp.dest('build/images/')),
  gulp.src('src/data/*.json').pipe(gulp.dest('build/data/')),
));

gulp.task('copy-html', () =>
  mergeStream(gulp.src('*.html').pipe(gulp.dest('build/'))));

gulp.task('compress', (cb) => {
  pump(
    [gulp.src('src/js/*.js'),
      babel({ presets: ['env'] }),
      // uglify({ output: { quote_style: 1 } }),
      rename({ suffix: '-min' }),
      gulp.dest('build/js')],
    cb,
  );
});

// Compile Sass
gulp.task('sass', () =>
  gulp
    .src(['src/scss/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/styles')));

// Watch
gulp.task('watch', ['sass', 'compress', 'copy-html', 'copy'], () => {
  gulp.watch(['src/scss/*.scss'], ['sass']);
  gulp.watch(['src/scripts/*.js'], ['compress']);
  gulp.watch(['*.html'], ['copy-html']);
  gulp.watch(['src/images/**/*', 'src/data/*.json'], ['copy']);
});

// Default
gulp.task('default', ['watch']);
