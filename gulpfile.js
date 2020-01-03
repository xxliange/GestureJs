const gulp = require('gulp'),
    path = require('path'),
    fs = require('fs'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    postcss = require('gulp-postcss'),
    gulpReplace = require('gulp-replace'),
    cssmin = require('gulp-cssmin'),
    autoprefixer = require('autoprefixer'),
    cssgrace = require('cssgrace'),
    rollup = require('rollup'),
    resolve = require('rollup-plugin-node-resolve'),
    babel = require('rollup-plugin-babel'),
    banner = require('./banner');


gulp.task('css', async()=>{
    gulp.src('./src/css/**/*.css')
    .pipe(concat('gesture.css'))
    .pipe(postcss([
        autoprefixer,
        cssgrace
    ]))
    .pipe(gulp.dest('./build'))
    .pipe(rename('gesture.min.css'))
    .pipe(cssmin())
    .pipe(gulp.dest('./build'))
    
})

gulp.task('script', async ()=>{
    await rollup.rollup({
        input:'./src/js/gesture.js',
        plugins:[
            resolve(),
            babel({
                exclude : 'node_modules/**'
            })
        ]
    }).then(bundle=>{
        bundle.write({
            file:'./build/gesture.js',
            format:'umd',
            name:'GestureJs',
            banner
        }).then(()=>{
            gulp.src('./build/gesture.js')
            .pipe(gulpReplace(/__INLINE_CSS__/gm, function(){
                var filePath = path.resolve(__dirname, 'build', 'gesture.css');
                var content = fs.readFileSync(filePath).toString('utf-8');
                content = content.replace(/\n/g, '').replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
                return content;
            }))
            .pipe(gulp.dest('./build'))
            .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(rename('gesture.min.js'))
            .pipe(sourcemaps.write(''))
            .pipe(gulp.dest('./build'))
        })
    })
});

gulp.task('default', gulp.parallel(['script', 'css'], ()=>{
    gulp.watch('./src/js/**/*.js', gulp.series('script'));
    gulp.watch('./src/css/**/*.css', gulp.parallel(['css', 'script']));
}));