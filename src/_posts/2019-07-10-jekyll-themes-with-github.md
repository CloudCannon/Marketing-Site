---
title: Jekyll themes with GitHub
staff_member: jordan-trbuhovic
category: Tutorial
image: /uploads/website.png
image_featured: true
---

Recently we covered [turning a Jekyll theme into a Gem and hosting it privately on GemFury](https://cloudcannon.com/tutorial/2019/06/13/private-jekyll-themes-with-gemfury/){: target="_blank"}. In this post we’re demonstrating how you can host your theme on GitHub . GitHub allow both public and private repository/theme hosting.

### Create a theme repository

First, [create a repository](https://github.com/new){: target="_blank"} on GitHub. Anyone can use your theme if the repository is public.

![](/images/blog/jekyll-themes-with-github/screen-shot-2019-06-27-at-9-59-17-am.png){: width="1460" height="850"}

Clone the repository to your local machine and open it from the command line. The Jekyll&nbsp;`new-theme`{: .language-console} command builds a basic theme structure that includes the `_layouts`, `_includes` and `_sass` directories. Start building a theme by entering the following into your command line:

~~~shell
$ jekyll new-theme mytheme
~~~

This generates a basic Jekyll site which other sites can inherit from. The Jekyll&nbsp;`new-theme`{: .language-console} command also creates a gemspec file (`mytheme.gemspec`). This holds the version, and other relevant theme details.

It is good practice to add all relevant details to the `.gemspec` file, and the `README.md` file. You will receive build errors if the `.gemspec` and `README.md` files contain “FIXME” and “TODO” entries.

Push these changes to your theme's repository on GitHub to ensure everything is up to date.

### Using Themes

To build a themed site the `Gemfile` should specify where to download the theme from. Open your site’s `Gemfile` and add the following line:

~~~ruby
gem 'mytheme', '>= 0.1.0', :git => 'https://github.com/GITHUB-USERNAME/mytheme.git'
~~~

Jekyll also needs to know that the site is using a theme. Specify the theme you are using within the site’s `_config.yml` file.

~~~yaml
theme: mytheme
~~~

### **Using Different Versions**

It is also possible to specify a particular theme ref/commit, branch, or tag to use.

~~~ruby
gem 'mytheme', '>= 1.2.4', :git => 'https://github.com/GITHUB-USERNAME/mytheme.git'
:git => 'https://github.com/GITHUB-USERNAME/mytheme.git', :ref => '6afec'
:git => 'https://github.com/GITHUB-USERNAME/mytheme.git', :branch => '1-2-beta'
:git => 'https://github.com/GITHUB-USERNAME/mytheme.git', :tag => 'v1.2.4'
~~~

### Private Themes

Private repositories can be accessed using OAuth Tokens instead of personal credentials. To create an OAuth Token follow these steps:

1. Open your GitHub account settings
2. Select *Developer Settings* from the left-hand menu
3. Select *Personal Access Tokens* from the left-hand menu
4. Select the *Generate New Token* button

![](/images/blog/jekyll-themes-with-github/screen-shot-2019-06-27-at-9-56-42-am.png){: width="1998" height="646"}

Set the relevant permissions which the token will have access to. Once the token has generated, note it and keep it private. Keys are not recoverable once they're lost.

To use a private theme the repository URL specified in the site's `Gemfile` needs to include the token:[…](https://cloudcannon.com/tutorial/2019/06/13/private-jekyll-themes-with-gemfury/){: target="_blank"}

~~~ruby
gem 'mytheme', '>= 0.1.0', :git => 'https://TOKEN:x-oauth-basic@github.com/USERNAME/mytheme.git'
~~~

If you include the `TOKEN` string in your `Gemfile` directly, you can start to receive a lot of warnings from the GitGuardian. In this case, you can keep your secret key in CloudCannon environment variables. In CloudCannon navigate to *Settings &gt; Configuration &gt; Environment Variables.*

Add the *key* `GIT_SECRET`{: .language-console} and add your token as the value. Then inside of your `Gemfile` import this environment variable and replace the `TOKEN` string with variable.

~~~ruby
auth = ENV['GIT_SECRET']
gem 'mytheme', '>= 0.1.0', :git => 'https://#{auth}:x-oauth-basic@github.com/USERNAME/mytheme.git'
~~~

Be sure to specify the theme you are using within the site’s `_config.yml` file.

### Updating Themes

The `Gemfile.lock` will always lock to a specific commit/version. Run the `bundle update theme_name` command to pull new theme changes/versions.

### Summary

Using themes with GitHub can be more convenient while you’re developing. With GitHub repositories, you don’t need to release a gem for every change or update. Once a theme is stable it may be more beneficial to use a Gem. Using Gems help to keep consistency with versioning across your sites.