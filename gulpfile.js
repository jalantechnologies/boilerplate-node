const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const babel = require('gulp-babel');

const SRC_DIR = 'src';
const DEST_DIR = 'dist';

gulp.task('compile', () =>
  gulp.src([`${SRC_DIR}/**/*.js`])
    .pipe(babel({
      presets: ['env'],
      plugins: ['transform-runtime'],
    }))
    .pipe(gulp.dest(DEST_DIR)));

gulp.task('copy_locales', () =>
  gulp.src([`${SRC_DIR}/locales/**/*.json`])
    .pipe(gulp.dest(`${DEST_DIR}/locales`)));

gulp.task('copy_assets', () =>
  gulp.src([`${SRC_DIR}/public/**/*.*`])
    .pipe(gulp.dest(`${DEST_DIR}/public`)));

gulp.task('copy_views', () =>
  gulp.src([`${SRC_DIR}/views/**/*.*`])
    .pipe(gulp.dest(`${DEST_DIR}/views`)));

gulp.task('build', ['compile', 'copy_locales', 'copy_assets', 'copy_views']);

gulp.task('serve', ['build'], () => nodemon({
  watch: SRC_DIR,
  tasks: ['compile'],
}));
