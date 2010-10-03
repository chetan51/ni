/*
 * 	HomeControllers - a controller to be used with Ni that is called by
 *	the router when a user visits the root URL, /.
 *
 *	When the root URL, /, is loaded, the index function below is called.
 */

var HomeController = function() {
	this.index = function(req, res) {
		res.ok('Hello world!');
	}
};

module.exports = new HomeController();