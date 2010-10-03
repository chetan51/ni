/*	
 *	This is an example of how to use Ni to organize your code into a nice,
 *	neat MVC project.
 *
 *	You can place your controllers, models, views, libraries and helpers into
 *	respective folders /controllers, /models, /views, /libraries, /helpers, and
 *	they will be loaded when you call Ni.boot into the Ni object.
 *
 *	Take a look at the example controllers and views for how to structure that
 *	code to make it integrate with Ni.
 */

/*
 * 	Module dependencies
 */

global.Connect = require('connect');
global.Mu = require('mu');
global.Quip = require('quip');

/*
 * 	Initialize Ni into a global object.
 */

global.Ni = require('../lib/ni');

/*
 * 	Load Ni and start the server.
 */

Ni.setRoot(__dirname);			// Tells Ni where to look for the folders

Ni.boot(function() {				// Boots Ni and loads everything
	
	var app = Connect.createServer( 	// Create server when Ni is finished
										// booting
										 
		Quip(),								// Helps in sending HTTP responses
		
		Ni.router,						// The Ni router automatically
											// directs requests based on URL
											// segments to the appropriate
											// controller functions
											 
		function (req, res, next) {			// Called if no controller /
											// function for the URL given is
											// found
			res.notFound('Page not found.');
		}
	);
	
	app.listen(3000);

	console.log('Application server started on port 3000');
});