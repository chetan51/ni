/*
 *  Ni - a minimalistic Node framework that makes setting up an MVC project
 *  a breeze. Inspired by CodeIgniter.
 *
 *  Since Ni is fully contained in a Node module, you can use it with Connect
 *  and your own choice of template engine, database, static file server, etc.
 *  No frills, no restrictions, no worries.
 */

/*
 *  Module dependencies
 */

var fs = require('fs'),
    Step = require('step');

/*
 *  Ni object
 */

var Ni = function() {

    var Ni = this;

    /*
     *  Set the optional call context for controllers (should be the running app).
     */

    this.setContext = function(ctx) {
        this.context = ctx;
    };

    /*
     *  Getter and setter for configuration variables.
     */

    this.config = function(name, value) {
        
        if (typeof(name) != 'undefined' && typeof(value) != 'undefined') {
            // This is a setter
            this.config[name] = value;

            return true;
        }
        else if (typeof(name) != 'undefined') {
            // This is a getter
            return this.config[name];
        }
        else {
            return null;
        }

    }
    
    /*
     *  Default configuration settings
     */

    //  Whether to use automatic views by default
    this.config('automatic_views', false);
    
    // default view directory name
    this.config('view_dir', 'views');
    
    // default view directory name
    this.config('custom_routes', []);
    
    /*
     *  Loads controllers, models, views, templates and helpers from the root
     *  directory, and makes them all available to the Ni object.
     *
     *  Before calling this function, make sure you tell Ni where the root
     *  directory is located by setting the configuration variable "root" with
     *  Ni.config('root', LOCATION);
     */
    
    this.boot = function(callback) {

        Step(
                function bootStrapEverything() {

                    bootStrapControllers(Ni.config('root'), this.parallel());
                    bootStrapModels(Ni.config('root'), this.parallel());
                    bootStrapViews(Ni.config('root'), this.parallel());
                    bootStrapLibraries(Ni.config('root'), this.parallel());
                    bootStrapHelpers(Ni.config('root'), this.parallel());

                },
                function buildNi(err, controllers, models, views, libraries, helpers) {

                    if (err) throw err;
                    Ni.controllers = controllers;
                    Ni.models = models;
                    Ni.views = views;
                    Ni.libraries = libraries;
                    Ni.helpers = helpers;
                    callback();

                }
            );

    }

    /*
     *  Provides router for Connect to automatically call the correct controller
     *  functions with the correct arguments based on the URL. If the controller
     *  or action is not found, it calls next() in the Connect list.
     *
     *  Add this to your Connect call as: Ni.router
     */
    
    this.router = function(req, res, next) {

        var parsedUrl = require('url').parse(req.url, true),
        pathArr,
        args, 
        controller,
        fn;
        
        parsedUrl = Ni.checkCustomRoutes(parsedUrl.pathname, req.method);
        if (parsedUrl.indexOf('/') !== 0) {
            parsedUrl = '/' + parsedUrl;
        }
        pathArr = parsedUrl.split('/');
        args = pathArr.slice(3);
        
        res.Ni = { view: Ni.config('automatic_views') };
        
        args.unshift(next);
        args.unshift(res);
        args.unshift(req);
        if (pathArr[1]) {
            controller = Ni.controllers[pathArr[1]];
            if (controller) {
                res.Ni.controller = pathArr[1];
                var fn;
                if (pathArr[2]) {
                    res.Ni.action = pathArr[2];
                    fn = controller[pathArr[2]];
                }
                else {
                    res.Ni.action = 'index';
                    fn = controller.index;
                }

                if (typeof(controller.__init) === 'function' && fn) {
                  args.unshift(function () {
                    args.shift();
                    fn.apply(Ni.context, args);
                  });
                  controller.__init.apply(null, args);
                } else if (fn) {
                    fn.apply(Ni.context, args);
                }
                else {
                    res.Ni.controller = undefined;
                    res.Ni.action = undefined;
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
                res.Ni.controller = 'home';
                res.Ni.action = 'index';

                if (typeof(controller.__init) === 'function') {
                  controller.__init(function () {
                    controller.index.call(Ni.context, req, res, next);
                  }, req, res, next);
                } else {
                  controller.index.call(Ni.context, req, res, next);
                }
            }
            else {
                next();
            }
        }

    }
    
    /*
     *  Add a custom route with a source (can be string, regex or function) and destination (string).
     *
     *  If a route matches, the path is rewritten to the specified destination.
     *
     *  A string route matches if it is exactly the same as the path. It rewrites to exactly the given destination.
     *  A regex route matches if it matches the path. It rewrites to path.replace(source, destination).
     *  A function matches if - given the path and custom route object - it returns a non-falsy value. It rewrites to the return of the function if that is a string or to the given destination.
     */
    this.addRoute = function (src, dest, method) {
        if (arguments.length < 2 && typeof(src) !== 'function') {
            throw new Error('Ni.addRoute expects 2 arguments if the first is not a function - '+arguments.length+' were given.');
        }
        var routes = Ni.config('custom_routes') || [];
        routes.push({
            src: src,
            dest: dest || '/',
            method: method || false
        });
        Ni.config('custom_routes', routes);
    }
    
    /*
     *  Checks the given url for the first matching custom route.
     */
    this.checkCustomRoutes = function (path, method) {
        var routes = Ni.config('custom_routes');
        if (!Array.isArray(routes) || routes.length === 0)
            return path;
        for (var i = 0, len = routes.length; i < len; i++) {
            var route = routes[i]
            , type = typeof(route.src),
            methodMatch = !route.method; // if no method is specified in the route, automatically set to matched
	        
	        if (!methodMatch && Array.isArray(route.method)) {
	            for (var n = 0, lenn = route.method.length; n < lenn; n++) {
	                if (route.method[n].toUpperCase() === method)
	                    methodMatch = true; 
	            }
	        } else if (!methodMatch) {
	            methodMatch = route.method === method;
	        }
            if (methodMatch && type !== 'undefined') {
                switch(type) {
                    case 'string':
                        if (path === route.src) {
                            return route.dest;
                        }
                    break;
                    case 'function':
                        if (typeof(route.src.exec) !== 'undefined') {
                            // regex
                            if (route.src.exec(path)) {
                                return path.replace(route.src, route.dest);
                            }
                        } else {
                            // function
                            var result = route.src(path, route);
                            if (result) {
                                return typeof(result) === 'string' ? result : route.dest;
                            }
                        }
                }
            }
        }
        return path;
    }
    
    this.renderView = function (renderer) {

        if (typeof(renderer) === 'function') {
            Ni.config('automatic_views', true);

            return function (req, res, next) {

                if (res.Ni.view && typeof(res.Ni.action) !== 'undefined') {
                    renderer(req, res, next, Ni.config('root') + '/' +
	                    Ni.config('view_dir') + '/' + 
                      res.Ni.controller + '/' + res.Ni.action);
                } else {
                    next();
                }

            }
        } else {
            throw new Error('Ni.renderView expects a function as the first argument');
        } 

    }

    /*
     *  Gets a specific controller by name.
     */

    this.controller = function(name) {

        return Ni.controllers[name];

    }

    /*
     *  Gets a specific model by name.
     */

    this.model = function(name) {

        return Ni.models[name];

    }

    /*
     *  Gets a specific view by name.
     */

    this.view = function(name) {

        return Ni.views[name];

    }

    /*
     *  Gets a specific library by name.
     */

    this.library = function(name) {

        return Ni.libraries[name];

    }

    /*
     *  Gets a specific helper by name.
     */

    this.helper = function(name) {

        return Ni.helpers[name];

    }

};

/* Helper functions
*******************************************************************************/

/*
 *  Loads controllers.
 */

function bootStrapControllers(__root, callback) {

    bootStrapModules(__root + '/controllers', function(err, controllers) {

        if (err) throw err;
        callback(null, controllers);

    });

}

/*
 *  Loads models.
 */

function bootStrapModels(__root, callback) {

    bootStrapModules(__root + '/models', function(err, models) {

        if (err) throw err;
        callback(null, models);

    });

}

/*
 *  Loads views.
 */

function bootStrapViews(__root, callback) {

    var __views = __root + '/views';
    var views = {};
    
    loadFilesFromDir(__views, function(dir, file, name, callback) {

        var view = {};
        view.path = dir + '/' + file;

        fs.readFile(view.path, 'utf-8', function(err, data) {
            
            if (err) callback(err);
            else {
                view.template = data;
                views[name] = view;
                callback(null);
            }

        });

    }, function(err) {

        if (err) throw err;
        callback(null, views);

    });

}

/*
 *  Loads libraries.
 */

function bootStrapLibraries(__root, callback) {

    bootStrapModules(__root + '/libraries', function(err, libraries) {

        if (err) throw err;
        callback(null, libraries);

    });

}

/*
 *  Loads helpers.
 */

function bootStrapHelpers(__root, callback) {

    bootStrapModules(__root + '/helpers', function(err, helpers) {

        if (err) throw err;
        callback(null, helpers);

    });

}

/*
 *  Loads anything that is represented as a Node.js module.
 *  This includes controllers, models, libraries and helpers.
 */

function bootStrapModules(__root, callback) { 

    var __modules = __root;
    var modules = {};

    loadFilesFromDir(__modules, function(dir, file, name, callback) {

        var name = file.split('.')[0];
        modules[name] = require(dir + '/' + file);
        
        callback();

    }, function(err) {

        if (err) callback(err);
        else callback(null, modules);

    });

}

/*
 *  Loads files from given directory and calls the given function on them.
 */

function loadFilesFromDir(dir, fnOnFile, callback) {

    fs.readdir(dir, function(err, files){

        if (err || !files) callback(null);
        else {
            Step(
                function readFiles() {

                    if (files.length > 0) {
                        var group = this.group();
                        files.forEach(function (file){
                            if (! /~$/.test(file)) {
                                var name = file.split('.')[0];
                                
                                fnOnFile(dir, file, name, group());
                            }
                        });
                    }
                    else {
                        return null;
                    }

                },
                function finish(err) {

                    if (err) callback(err);
                    callback(null);

                }
            );
        }

    });

}

/*
 *  Exports the Ni object to Node.js.
 */

module.exports = new Ni();
