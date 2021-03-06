const babel = require('rollup-plugin-babel');
const buffer = require('vinyl-buffer');
const del = require('del');
const gulp = require('gulp');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');

gulp.task('build', ['clean'], () =>
  rollup({
    entry: 'index.js',
    plugins: [
      babel({
        presets: [
          [
            "env",
            {
              "modules": false
            }
          ]
        ],
        exclude: 'node_modules/**'
      }),
    ],
    format: 'umd',
    moduleName: 'IncrementalDOM',
  })
  .pipe(source('incremental-dom-string.js'))
  .pipe(buffer())
  .pipe(gulp.dest('lib')));

gulp.task('build:watch', () =>
  gulp.watch('src/*.js', ['build']));

gulp.task('clean', () => del('lib'));

gulp.task('test:watch', () =>
  gulp.watch(['src/*.js', 'test/*.js'], ['test']));
