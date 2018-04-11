const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
// const uglify = require('gulp-uglify');
// const babel = require('gulp-babel');
const responsive = require('gulp-responsive');
const mergeStream = require('merge-stream');
const browserSync = require('browser-sync');

const server = browserSync.create();


gulp.task('copy', () => mergeStream(gulp.src('src/data/*.json').pipe(gulp.dest('build/data/'))));
gulp.task('copy-sw', () => mergeStream(gulp.src('sw.js').pipe(gulp.dest('build/'))));

gulp.task('copy-html', () =>
  mergeStream(gulp.src('*.html').pipe(gulp.dest('build/'))));

// Compile JS
gulp.task('compress', () =>
  gulp
    .src('src/js/*.js', { sourcemaps: true })
    // .pipe(babel({ presets: ['env'] }))
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

gulp.task('images', () => gulp
  .src('src/images/*.{jpg,png}')
  .pipe(responsive(
    {
      '*.{jpg,png}': [
        { width: 200, rename: { suffix: '-200px' } },
        { width: 400, rename: { suffix: '-400px' } },
        {
          width: 800,
          rename: { suffix: '-800px' }, // format: 'jpeg' // format of output image is detected from new filename // format option can be omitted because // Do not enlarge the output image if the input image are already less than the required dimensions.
          withoutEnlargement: true,
        },
        { width: 200, rename: { suffix: '-200px', extname: '.webp' } },
        { width: 400, rename: { suffix: '-400px', extname: '.webp' } },
        {
          width: 800,
          rename: { suffix: '-800px', extname: '.webp' }, // format: 'jpeg' // format of output image is detected from new filename // format option can be omitted because // Do not enlarge the output image if the input image are already less than the required dimensions.
          withoutEnlargement: true,
        },
      ],
    },
    {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 80,
      progressive: true,
      withMetadata: false,
      errorOnEnlargement: false,
    },
  ))
  .pipe(gulp.dest('build/images')));

// Watch
gulp.task('serve', ['sass', 'compress', 'copy-html', 'copy', 'copy-sw'], () => {
  browserSync.init({
    server: './build',
  });

  gulp.watch(['src/scss/*.scss'], ['sass']);
  gulp.watch(['src/js/*.js'], ['compress']);
  gulp.watch(['*.html'], ['copy-html']);
  gulp.watch(['sw.js'], ['copy-sw']);
  gulp.watch(['src/images/**/*', 'src/data/*.json'], ['copy']);
  gulp.watch(['build/*.html']).on('change', server.reload);
});

// Default
gulp.task('default', ['serve']);
