const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rm = require('gulp-rimraf');
const browserify = require('browserify');
const source = require('vinyl-source-stream');

gulp.task('clean', function() {
	return gulp.src(['lib/*', 'docs/*']).pipe(rm());
});

gulp.task('compile', ['clean'], function() {
	return gulp.src('src/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({presets: ['es2015']}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./lib'));
});

gulp.task('browserify', ['compile'], function() {
	var stream = browserify({
		entries: 'lib/Browser.js',
	})
	.bundle();

	return stream.pipe(source('skygrid-latest.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('minify', ['browserify'], function() {
	return gulp.src('dist/skygrid-latest.js')
	  .pipe(uglify())
	  .pipe(rename({ extname: '.min.js' }))
	  .pipe(gulp.dest('./dist'));
});

gulp.task('browser', ['browserify']);
gulp.task('deploy', ['browserify', 'minify']);

gulp.task('default', ['deploy']);