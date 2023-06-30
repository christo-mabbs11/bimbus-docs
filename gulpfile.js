// Use the command below to run the gulpfile.js
// npx gulp watch

const gulp = require("gulp");
const ts = require("gulp-typescript");

gulp.task("build", async function () {
  const tsProject = ts.createProject("tsconfig.json");
  await gulp.src("src/**/*.ts").pipe(tsProject()).pipe(gulp.dest("dist"));
});

gulp.task("watch", async function () {
  await gulp.watch("src/**/*.ts", gulp.series("build"));
});

gulp.task("default", gulp.series("build"));

