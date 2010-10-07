/*
 * 	Ni - a minimalistic Node framework that makes setting up an MVC project
 * 	a breeze. Inspired by CodeIgniter.
 *
 * 	Since Ni is fully contained in a Node module, you can use it with Connect
 * 	and your own choice of template engine, database, static file server, etc.
 * 	No frills, no restrictions, no worries.
 */

/*
 * 	Module dependencies
 */

var fs = require('fs'),
	Step = require('step');

/*
 * 	Ni object
 */

var Ni = function() {
	var Ni = this;
  this.config = {};
	
	/*
	 * 	Tells Ni what root directory to look into.
	 *
	 * 	Call this function before calling boot.
	 */
	
	this.setRoot = function(__root) {
		this.__root = __root;
	}

	/*
	 * 	Loads controllers, models, views, templates and helpers from the root
	 * 	directory, and makes them all available to the Ni object.
	 */
	
	this.boot = function(callbackDone) {
		Step(
				function bootStrapEverything() {
					bootStrapControllers(Ni.__root, this.parallel());
					bootStrapModels(Ni.__root, this.parallel());
					bootStrapViews(Ni.__root, this.parallel());
					bootStrapLibraries(Ni.__root, this.parallel());
				},
				function buildNi(err, controllers, models, views, libraries) {
					if (err) throw err;
					Ni.controllers = controllers;
					Ni.models = models;
					Ni.views = views;
					Ni.libraries = libraries;
					callbackDone();
				}
		    );
	}

	/*
	 * 	Provides router for Connect to automatically call the correct controller
	 * 	functions with the correct arguments based on the URL. If the controller
	 * 	or action is not found, it calls next() in the Connect list.
	 *
	 * 	Add this to your Connect call as: Ni.router
	 */
	
	this.router = function(req, res, next) {
		parsedUrl = require('url').parse(req.url, true);
		pathArr = parsedUrl.pathname.split('/');

		var controller;
		if (pathArr[1]) {
			controller = Ni.controllers[pathArr[1]];
			if (controller) {
				var fn;
				if (pathArr[2]) {
					fn = controller[pathArr[2]];
				}
				else {
					fn = controller.index;
				}

				if (fn) {
					var args = pathArr.slice(3);
					args.unshift(res);
					args.unshift(req);
					fn.apply(null, args);
				}
				else {
					next();
				}
			}
			else {
				next();
			}
		}
		else {
			controller = Ni.controllers.home;
			if (controller && controller.index) {
				controller.index(req, res);
			}
			else {
				next();
			}
		}
	}
};

/* Helper functions
*******************************************************************************/

/*
 * 	Loads controllers.
 */

function bootStrapControllers(__root, callback) {
	bootStrapModules(__root + '/controllers', function(err, controllers) {
		if (err) throw err;
		callback(null, controllers);
	});
}

/*
 * 	Loads models.
 */

function bootStrapModels(__root, callback) {
	bootStrapModules(__root + '/models', function(err, models) {
		if (err) throw err;
		callback(null, models);
	});
}

/*
 * 	Loads views.
 */

function bootStrapViews(__root, callback) {
	var __views = __root + '/views';
	var views = {};
	
	loadFilesFromDir(__views, function(dir, file, name) {
		var view = {};
		view.path = dir + '/' + file;
		fs.readFile(view.path, 'utf-8', function(err, data) {
			view.template = data;
			views[name] = view;
		});
	}, function(err) {
		if (err) throw err;
		callback(null, views);
	});
}

/*
 * 	Loads libraries.
 */

function bootStrapLibraries(__root, callback) {
	bootStrapModules(__root + '/libraries', function(err, libraries) {
		if (err) throw err;
		callback(null, libraries);
	});
}

/*
 * 	Loads anything that is represented as a Node.js module.
 * 	This includes controllers, models, libraries and helpers.
 */

function bootStrapModules(__root, callback) { 
	var __modules = __root;
	var modules = {};

	loadFilesFromDir(__modules, function(dir, file, name) {
		var name = file.split('.')[0];
		modules[name] = require(dir + '/' + file);
	}, function(err) {
		if (err) callback(err);
		else callback(null, modules);
	});
}

/*
 * 	Loads files from given directory and calls the given function on them.
 */

function loadFilesFromDir(dir, fnOnFile, callbackDone) {
    fs.readdir(dir, function(err, files){
        if (err || !files) callbackDone(null);
		else {
			Step(
				function readFiles() {
					if (files.length > 0) {
						var group = this.group();
						files.forEach(function (file){
							var name = file.split('.')[0];
							
							fnOnFile(dir, file, name);
							group()();	
						});
					}
					else {
						return null;
					}
				},
				function finish(err) {
					if (err) callbackDone(err);
					callbackDone(null);
				}
			    );
		}
    });
}

/*
 * 	Exports the Ni object to Node.js.
 */

module.exports = new Ni();