const gulp = require('gulp');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rm = require('gulp-rimraf');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const envify = require('envify/custom');

let addressEnv = null;
process.argv.map((item, idx) => {
	if (item === '--address') {
		addressEnv = process.argv[idx + 1];
	}
});

gulp.task('clean', function() {
	return gulp.src(['lib/*', 'docs/*']).pipe(rm());
});

gulp.task('vet', function() {
	return gulp.src('src/*.js')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('compile', ['clean'], function() {
	return gulp.src('src/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({ presets: ['es2015'] }))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./lib'));
});

gulp.task('browserify', ['compile'], function() {
	const stream = browserify({
		entries: 'lib/Browser.js',
	})
	.transform(envify({
		SKYGRID_SERVER_ADDRESS: addressEnv
	}))
	.bundle();

	return stream.pipe(source('skygrid.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('minify', ['browserify'], function() {
	return gulp.src('dist/skygrid.js')
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(gulp.dest('./dist'));
});

gulp.task('test', ['browserify'], function() {
	
});

gulp.task('browser', ['browserify']);
gulp.task('deploy', ['browserify', 'minify']);

gulp.task('default', ['deploy']);