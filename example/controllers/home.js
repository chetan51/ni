/*
 *  HomeController - a controller to be used with Ni that is called by
 *  the router when a user visits the root URL, /.
 *
 *  When the root URL, /, is loaded, the index function below is called.
 */

/*
 *  Module dependencies
 */

var Ni = require('../../lib/ni');

/*
 *  The home controller
 */

var HomeController = function() {

    this.index = function(req, res, next) {
        res.ok('Hello ' + Ni.config('location') + '!');
    }

};

/*
 *  Exports the home controller
 */

module.exports = new HomeController();