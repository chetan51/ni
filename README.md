Ni - a minimalistic Node framework that makes setting up an MVC project a breeze
================================================================================

Ni helps you set up a well-organized project, with a file structure separated into models, views, controllers, libraries and helpers. It's intuitive and simple to use, and doesn't get in the way of using other modules and Node plugins in your project.

Ni is inspired by [CodeIgniter](http://codeigniter.com/), and its name is an abbreviation of NodeIgniter.

What's awesome about Ni?
---------------------------

* It's packaged as a regular Node module, so you just `require` it and you're ready to go
* You can use other Node modules and Connect middle-ware as you usually would; Ni doesn't get in the way
* It's easy to use and loads your models, views, controllers, libraries and helpers automatically so you can just start using them everywhere

How do I use Ni?
-------------------

It's as simple as telling Ni where to look for your files, and then asking it to boot:

    var Ni = require('../lib/ni');

    Ni.config('root', "myapp/src");

    Ni.boot(function() {
        // Ready to start the server!
    });

The rest of your code now has access to all your models, views, and controllers with `Ni.model('MODELNAME')`, `Ni.view('VIEWNAME')` and `Ni.controller('CONTROLLERNAME')`.

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

    http://myapp.com/[controller]/[function]/[argument 1]/[argument 2]/[etc]

If no controller is specified (`http://myapp.com/`), it loads the `home` controller's `index` function.

If no function is specified (http://yourapp.com/[controller]), it loads the `[controller]`'s `index` function.

You can define custom routes using Ni.addRoute(source, destination[, method]);

Some examples:

With this custom route calling myapp.com will internally redirect to use your News controller and call the index function on it:
    Ni.addRoute('/', '/News/index');

You can use regular expressions as well. This leads myapp.com/register to your User controller and its "register" function:
    Ni.addRoute(/^\/register/i, '/User/register');

If you want to use arguments with custom routes, you can do that as well:
    Ni.addRoute(/^\/details\/(.*)$/i, '/User/details/$1');

You can also define functions to test the path. For example:
Calling myapp.com/add/1/2 will internally redirect to use the "Number" controller and call the "positive" function, while calling 
myapp.com/add/1/-2 will call the "negative" function.
	Ni.addRoute(function(path) {
	    var args = path.split('/'),
	    firstNum = parseInt(args[2]),
	    secondNum = parseInt(args[3]),
	    result = firstNum + secondNum;
        if (args[1] !== 'add')
            return false; // this leaves the path untouched and prevents this function from sucking in all other requests as well
	    return result > 0 ? '/Number/positive' : '/Number/negative';
	});

You can limit the allowed HTTP methods by using custom routes. 
This will internally redirect myapp.com/comment to use your "Comments" controler and its "new" function - but only if the used HTTP Method is POST or PUT:

    Ni.addRoute('/comment', '/Comments/new', ['POST', 'PUT']);

And this will redirect all GET requests to myapp.com/comment to use your "Comments" controllers index function.
    Ni.addRoute('/comment', '/Comments/', 'GET');

This way you can disallow methods for some routes as well:
    Ni.addRoute('/Comments/update', '/Home/method_not_allowed', 'GET');

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

* `Ni.controller('calculator')`
* `Ni.view('calculator')`
* `Ni.model('calculator')`

A really well-commented example is in the source code in the `/example` folder, check it out!

(Note that you'll need the following to run the example in the `/example` folder: [Connect](https://github.com/senchalabs/Connect), [Quip](https://github.com/caolan/quip) and [Mu](https://github.com/raycmorgan/Mu). You can get them easily using [npm](https://github.com/isaacs/npm).)

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

        this.index = function(req, res, next) {

            res.ok('Welcome to the calculator!');

        }

        /*
         *  This function is called when the URL indicates "add" as the function
         *  to be called, so it would look like /calculator/add.
         *
         *  For example, loading the URL /calculator/add/4/5 would call the below
         *  function with a = 4 and b = 5.
         */
        
        this.add = function(req, res, next, a, b) {

            if (a && b) {
                a = parseInt(a);
                b = parseInt(b);

                var template = Ni.view('calculator').template;
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

Contributors
------------

A big thank you to you guys who helped (and are helping) make Ni awesome:

[Moritz Peters](https://github.com/maritz)
