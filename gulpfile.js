const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');

const SRC_DIR = 'src';
const DEST_DIR = 'dist';
// for watching purpose only
const CONFIG_DIR = 'config';
// determining if env is testing
const IS_ENV_TESTING = process.env.NODE_ENV && process.env.NODE_ENV.toString().trim() === 'testing';
// add js only files for compilation
// excludes dir src/test/data - to be handled by separate task
const COMPILE_GLOBS = [
  `!${SRC_DIR}/test/data/**`,
  `${SRC_DIR}/**/*.js`,
];
// build tasks
const BUILD_TASKS = [
  'compile',
  'copy_locales',
  'copy_assets',
  'copy_views',
];

if (!IS_ENV_TESTING) {
  // if env is not testing, drop the test related stuff
  COMPILE_GLOBS.push(`!${SRC_DIR}/test/**`);
  COMPILE_GLOBS.push(`!${SRC_DIR}/**/*.spec.js`);
} else {
  // if env is testing, add test related stuff
  BUILD_TASKS.push('copy_test_data');
}

// NOTE: stream is returned in every task to signal async completion

gulp.task('compile', () => gulp.src(COMPILE_GLOBS)
  .pipe(babel({
    presets: ['env'],
    plugins: ['transform-runtime'],
  }))
  .pipe(gulp.dest(DEST_DIR)));

// simply copies locale files
gulp.task('copy_locales', () => gulp.src([`${SRC_DIR}/locales/*.json`])
  .pipe(gulp.dest(`${DEST_DIR}/locales/`)));

// simply copies test data files
gulp.task('copy_test_data', () => gulp.src([`${SRC_DIR}/test/data/**`])
  .pipe(gulp.dest(`${DEST_DIR}/test/data/`)));

gulp.task('copy_assets', () => gulp.src([`${SRC_DIR}/public/**/*.*`])
  .pipe(gulp.dest(`${DEST_DIR}/public`)));

gulp.task('copy_views', () => gulp.src([`${SRC_DIR}/views/**/*.*`])
  .pipe(gulp.dest(`${DEST_DIR}/views`)));

// linting via gulp - for all js files in root and src dir
// pipe #1 - pass it to eslint plugin (no explicit options, let eslintrc handle this)
// pipe #2 - format the results in default format
// pipe #3 - fail only after processing all the files
// noinspection JSCheckFunctionSignatures
gulp.task('lint', () => gulp.src(['*.js', `${SRC_DIR}/**/*.js`])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

gulp.task('build', BUILD_TASKS);

gulp.task('serve', ['build'], () => {
  // script stack to run on each cycle
  const scripts = [];
  // add scripts to stack
  // this always has to be in the end
  scripts.push(`node ./${DEST_DIR}/bin/www`);
  // run nodemon
  nodemon({
    exec: scripts.join(' && '),
    watch: [SRC_DIR, CONFIG_DIR],
    tasks: ['build'],
  });
});
