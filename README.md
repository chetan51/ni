Ni - a minimalistic Node framework that makes setting up an MVC project a breeze
================================================================================

Ni helps you set up a well-organized project, with a file structure separated into models, views, controllers, libraries and helpers. It's intuitive and simple to use, and doesn't get in the way of using other modules and Node plugins in your project.

Ni is inspired by [CodeIgniter](http://codeigniter.com/), and its name is an abbreviation of NodeIgniter.

What's awesome about Ni?
---------------------------

* It's packaged as a regular Node module, so you just `require` it and you're ready to go
* You can use other Node modules and Connect middle-ware as you usually would; Ni does not get in the way
* It's easy to use and loads your models, views, controllers, libraries and helpers automatically so you can just start using them everywhere

How do I use Ni?
-------------------

It's as simple as telling Ni where to look for your files, and then asking it to boot:

    var Ni = require('../lib/ni');
    Ni.setRoot(__dirname);
    Ni.boot(function() {
        // Ready to start the server!
    });

The rest of your code now has access to all your models, views, and controllers in `Ni.models`, `Ni.views` and `Ni.controllers`.

Note that your controllers, models, libraries and helpers should be packaged as Node modules, and your views can be plain text, template (Markdown, Mustache, etc), or HTML files.

You even get a router for free!
-------------------------------

Ni provides a router you can use with Connect to have requests sent to the appropriate controller functions according to URL segments.

Use it with Connect:

    var app = Connect.createServer(
        Ni.router
        // You can add other Connect middle-ware here
    );

It parses the URL and sends the request to the correct controller function as follows:

    http://yourapp.com/[controller]/[function]/[argument 1]/[argument 2]/[etc]

If no controller is specified (`http://yourapp.com/`), it loads the `home` controller's `index` function.

If no function is specified (http://yourapp.com/[controller]), it loads the `[controller]`'s `index` function.

Can I see an example?
---------------------

If you have your project organized like this:

    /app.js
    /controllers
        /calculator.js
        /home.js
    /views
        /calculator.html
        /home.html
    /models
        /calculator.js

You can access your stuff with:

* `Ni.controllers.calculator`
* `Ni.views.calculator`
* `Ni.models.calculator`

A really well-commented example is in the source code in the `/example` folder, check it out!

How would my controllers, models, libraries, helpers look?
-------------------------------------------------------

Each of those is just a Node module. For example, the calculator controller mentioned above (in the `/example` folder) looks like this:

    var Ni = require('../../lib/ni'),
        Mu = require('mu'),
        Quip = require('quip');

    var CalculatorController = function() {
        
        /*
         *  This function is called when the URL does not indicate a function to
         *  be called, so it would look like /calculator.
         */

        this.index = function(req, res) {
            res.ok('Welcome to the calculator!');
        }

        /*
         *  This function is called when the URL indicates "add" as the function
         *  to be called, so it would look like /calculator/add.
         *
         *  For example, loading the URL /calculator/add/4/5 would call the below
         *  function with a = 4 and b = 5.
         */
        
        this.add = function(req, res, a, b) {
            if (a && b) {
                a = parseInt(a);
                b = parseInt(b);

                var template = Ni.views.calculator.template;
                var data = {result: a + b};

                var compiled = Mu.compileText(template, null);
                compiled(data).addListener('data', function (c) {
                    res.ok(c);
                });
            }
            else {
                res.error("a and b must both be provided.");
            }
        }
    };

    module.exports = new CalculatorController();

How to organize your code
-------------------------

Coming soon.

Let's get crackin'!
-------------------

1. Get Ni by downloading the source code, or `git clone`ing the repo. 
2. Install Ni as your would any other Node module, by copying `lib/ni.js` to your `~/.node_libraries` folder.
3. Copy the `/example` directory and modify it to set up your project.
4. Run `node app.js` in the copied directory to start the server.

(We'll add Ni to `npm` soon, don't trip.)
