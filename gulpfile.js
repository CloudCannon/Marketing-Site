const gulp = require("gulp");
const suite = require("@cloudcannon/suite");

suite.dev(gulp);

suite.screenshots(gulp);

suite.help(gulp);

gulp.task("default", gulp.series("help"));
