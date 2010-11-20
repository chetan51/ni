/*
 *  CalculatorController - a controller to be used with Ni that is called by
 *  the router when a user visits a URL that starts with /calculator.
 *
 *  Controllers are represented as Javascript objects, and exported as a Node
 *  module after the object definition.
 *  
 *  Functions in controllers are called with the request and result as arguments
 *  (just like Connect functions are called) and then with the rest of the
 *  segments of the URL as the rest of the arguments.
 *
 *  For example, loading the URL /calculator/add/4/5 would call the add function
 *  below with a = 4 and b = 5.
 *
 *  If no function is specified in the URL (such as the URL /calculator), then
 *  then index function is called if it exists.
 *
 *  Note: The req argument gives you access to the request, and you can use the
 *  res argument to send back a response to the browser or requester.
 */

/*
 *  Module dependencies
 */

var Ni = require('../../lib/ni'),
    Mu = require('mu'),
    Quip = require('quip');

/*
 *  The calculator controller
 */

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

/*
 *  Exports the calculator controller
 */

module.exports = new CalculatorController();