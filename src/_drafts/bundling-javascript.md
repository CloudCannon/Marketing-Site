---
title: Bundling JavaScript for Jekyll
staff_member: ryan-collins
category: Tutorial
image:
image_featured: true
---
Optimising assets can significantly improve load times for visitors to your site. When you build a site on CloudCannon, any assets referenced in your HTML/CSS are automatically [minified and served from a CDN](https://docs.cloudcannon.com/builds/optimisations/). JavaScript files are minified using [UglifyJS](https://www.npmjs.com/package/uglify-js).

In some cases, you may also want to bundle your JavaScript files together, to reduce the number of HTTP requests made when loading a page. The simplest solution would be to write all your code in a single file, but this compromises maintainability. Instead, you can use various techniques to bundle your files together on build for performance, while keeping them separate during development for sanity.

## Jekyll includes

A simple technique for bundling JavaScript is to use Jekyll includes. With this approach, a single JavaScript file would use `{% raw %}{% include %}{% endraw %}` tags to include other scripts. For example, you could create a `bundle.js` file with the following:

```js
---
---
{% raw %}{% include /assets/script-1.js %}
{% include /assets/script-2.js %}{% endraw %}
```

> Remember to add front matter dashes in bundle.js so that Jekyll processes the Liquid.
{: .explainer }

This allows you to divide your JavaScript into manageable pieces in development, while only linking to `bundle.js` on your site: 

```html
<script src="{%raw%}{{ site.baseurl }}{%endraw%}/js/bundle.js"></script>
```

Note that if you don't want to keep all your scripts in the _includes folder, you can use the [include_relative](https://jekyllrb.com/docs/includes/#including-files-relative-to-another-file) tag. This will allow you to specify a path relative to the file where the tag is being used (you cannot access higher-level directories however). For better readability, you might also want to keep your includes in the front matter and use Liquid to manage the include tags. 

For example, if you are working in `/js/bundle.js` and your JavaScript files are in `/js/scripts/`, you could use the following:

```
---
dir_path: scripts/
scripts:
  - script-1.js
  - script-2.js
---
{% raw %}{% for script in scripts %}
    {% assign script_path = dir_path | append: script %}
    {% include_relative script_path %}
{% endfor %}{% endraw %}
```

Bear in mind that the scripts are simply being concatenated, so you will need to be mindful of conflicting variable names. You can avoid this problem by wrapping each script in a function that is called as soon as it is defined (i.e. an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)). Variables within the function cannot be accessed from outside of it, so there won't be any conflicting variables between the included scripts.

```js
---
dir_path: scripts/
scripts:
  - script-1.js
  - script-2.js
---
{% raw %}{% for script in scripts %}
    {% assign script_path = dir_path | append: script %}
    (function () {
        {% include_relative script_path %}
    })();
{% endfor %}{% endraw %}
```

## Using webpack

[webpack](https://webpack.js.org/) is a JavaScript bundler. It searches your code for dependencies and bundles scripts together in a single file. First, install webpack:

```sh
$ npm install webpack
$ npm install webpack-cli
```

On the command line, specify each JavaScript file you want to bundle, then specify the destination for the bundle with `-o path/to/output.js`. For example:

```sh
$ node_modules/.bin/webpack js/file-1.js \
js/file-2.js \
js/file-3.js \
-o js/output.js
```

This will bundle all your scripts into one file. In your `<script>` tags, you can simply link to the bundled file:

```html
<script src="{%raw%}{{ site.baseurl }}{%endraw%}/js/output.js"></script>
```

Instead of specifying each input file on the command line, you can create an `entry.js` file. This file should just require/import all the scripts you want to bundle. Then, you can use this as your input and all of the other imported scripts will be bundled.

```sh
$ ./node_modules/.bin/webpack path/to/entry.js -o js/output.js
```

This is very basic use of webpack - see the [webpack docs](https://webpack.js.org/guides/getting-started/#using-a-configuration) for more configuration options.

## Using Gulp

[Gulp](https://gulpjs.com/) is a JavaScript toolkit for automating tasks. You can use this with the [gulp-concat](https://www.npmjs.com/package/gulp-concat) package to bundle your JavaScript files together.

First, create a `package.json` by running `npm init`. Then install gulp and gulp-concat and add them to your project dev dependencies:

```sh
$ npm install --save-dev gulp
$ npm install --save-dev gulp-concat
```

Create a `gulpfile.js` at the root of your project with the following:

```js
const gulp = require('gulp');
const concat = require('gulp-concat');

gulp.task('concat-scripts', function() {
    return gulp.src('./input-scripts/*.js')
        .pipe(concat('output.js'))
        .pipe(gulp.dest('./assets/'));
});
```

`gulp.task` defines a task called "concat-scripts". This task uses `gulp.src` to read in all JavaScript files from an /input-scripts/ directory. The scripts are concatenated into an output.js file, which is then saved into the /assets/ directory using `gulp.dest`.

You can run this task from the command line in your project directory with `gulp concat-scripts`. Then you can simply link to /assets/output.js on your site:

```html
<script src="{%raw%}{{ site.baseurl }}{%endraw%}/assets/output.js"></script>
```

If you want to minify your script after bundling it, you can do this easily with [gulp-uglify](https://www.npmjs.com/package/gulp-uglify). This will reduce the size of your bundled script, to improve performance for visitors to your site.

```sh
$ npm install --save-dev gulp-uglify
```

```js
const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

gulp.task('concat-and-minify-scripts', function() {
    return gulp.src('./input-scripts/*.js')
        .pipe(concat('output.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./assets/'));
});
```

## Prebuild commands in CloudCannon

CloudCannon supports custom commands, so that you can use tools like Gulp and webpack easily. Simply create a `_cloudcannon-prebuild.sh` file at the root of your project with any commands you want to run before each site build.

Your prebuild commands run in a Node environment, so you can install any npm packages you need.

For example:

```sh
npm install webpack
npm install webpack-cli

./node_modules/.bin/webpack path/to/entry.js -o js/output.js
```

```sh
npm install gulp
npm install gulp-concat

./node_modules/.bin/gulp concat-task
```