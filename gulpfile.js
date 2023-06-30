// Use the command below to run the gulpfile.js
// npx gulp watch

const gulp = require("gulp");
const ts = require("gulp-typescript");
const plumber = require("gulp-plumber");

gulp.task("build", function () {
  const tsProject = ts.createProject("tsconfig.json");
  return gulp
    .src("src/**/*.ts")
    .pipe(plumber()) // Add the plumber() function here
    .pipe(tsProject())
    .pipe(gulp.dest("dist"));
});

gulp.task("watch", function () {
  gulp.watch("src/**/*.ts", gulp.series("build"));
});

gulp.task("default", gulp.series("build"));
