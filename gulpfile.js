const gulp = require("gulp");
const ts = require("gulp-typescript");

gulp.task("build", function () {
  const tsProject = ts.createProject("tsconfig.json");
  return gulp.src("src/**/*.ts").pipe(tsProject()).pipe(gulp.dest("dist"));
});

gulp.task("watch", function () {
  gulp.watch("src/**/*.ts", gulp.series("build"));
});

gulp.task("default", gulp.series("build"));
