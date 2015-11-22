/*
 * Production Environment
 * 
 * param: app
 * 
 * .bash_profile contains
 * NODE_ENV=production
 *
 * or start server as follows
 * NODE_ENV=production node server.js
 *
 * on Windows use
 * set NODE_ENV=production
 * check with
 * echo %NODE_ENV%
 */
module.exports = function(app) {
    var _Production = {};
    config = require('../configs/server.js');
    var configs = config.configs,
        server_prefix = configs.server_prefix || 'PREFIX';
    // User List
    if(typeof configs.user_list === 'undefined'){
        var user_list = {};
    }
    else {
        var user_list = configs.user_list;
    }
    console.log(server_prefix + " - Environments production required.");
    var express = require('express'),
        path = require('path'),
        i18n = require('i18n-2'),
        hash = require('../lib/pass.js').hash,
        bodyParser = require('body-parser'),
        session = require('express-session'),
        passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        FacebookStrategy = require('passport-facebook').Strategy;
    if('production' == app.settings.env) {
        console.log(server_prefix + " - Using production configurations");
        app.set('view engine', 'ejs');
        app.set('view options', {});
        app.set('views', __dirname + '/../views');


        // Parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({
           extended: true
        })); // NEW IN CONNECT 3.0
        // Parse application/json
        app.use(bodyParser.json()); // NEW IN CONNECT 3.0


        // Place i18n always AFTER cookieParser
        i18n.expressBind(app, {
            locales: ['en', 'nl'], // TODO get from config
            defaultLocale: 'en',   // TODO get from config
            directory: '../locales',
            // change the cookie name from 'lang' to 'locale'
            cookieName: 'locale'
        });
        app.use(function(req, res, next) {
            req.i18n.setLocaleFromQuery();
            req.i18n.setLocaleFromCookie();
            next();
        });
        // The i18n object will now reside within the request object of each request.
        // The above config also allows the locale to be set from query string or from cookie.
        // For example, the mysite.com/?lang=en will automatically set the locale to en.
        // To use the i18n object, simply use the __ function
        /*
         * function handlerFunc1(req, res){
         *   res.render('index', { title: req.i18n.__("hello") });
         * }
         */
        // Or if you want to use it in your view, simply use __ again
        /*
         * <h1>
         *   <%= __("hello") %>
         * </h1>
         */
        // i18n-2 will then look up the key hello in the locale files (by default located in locales/en.js and locales/nl.js).
        // If the keys or the files is not exist yet, it will then create those files and keys automatically for you
        // so you don’t have to worry about the errors.
        //
        // To change the language, you can set it directly using setLocale(locale) function. 
        // Beside that, you can set the cookie locale value for the browser to remember the current language for the next access.
        /*
         * function handlerFunc(req, res){
         *   // you can set it directly like this
         *   req.i18n.setLocale('en');
         *
         *   // or set it via the cookie
         *   res.cookie('locale', 'en');
         *   req.i18n.setLocaleFromCookie();
         *
         *   // redirect back
         *   res.redirect('back');
         * };
         */


        app.use('/app', express.static(path.join(__dirname, '/../public/app')));
        app.use('/tests', express.static(path.join(__dirname, '/../tests')));


        app.use(express.static(path.join(__dirname, '/../public'))); // Fall back to this as a last resort


        // These next instructions are placed after express.static to avoid passport.deserializeUser to be called several times
        app.use(session({secret: 'default', saveUninitialized: true, resave: true})); // required by passport, default values required
        app.use(passport.initialize());
        app.use(passport.session());

        /**
        * Passport
        * See http://truongtx.me/2014/03/29/authentication-in-nodejs-and-expressjs-with-passportjs-part-1/
        */
        passport.serializeUser(function(user, done) {
            console.log(server_prefix + " - Serialize user " + user);
            return done(null, user.id);
        });
        passport.deserializeUser(function(id, done) {
            var user = '';
            var user_keys = {};
            var user_not_found = true; // default to true
            // Lookup user in user list by id, if found set not_found to false
            for (key in user_list) {
                user = key;
                user_keys = user_list[key];
                for(user_key in user_keys) {
                    if(user_key == 'id') {
                        var id_key = user_key;
                        var id_value = user_keys[user_key];
                        if(id_value == id) {
                            id = id_value;
                            user_not_found = false;
                            break;
                        }
                    }
                }
            }//eof for
            if(user_not_found) {
                console.log(server_prefix + " - Deserialize user " + user + " failed: user not found");
                user = 'not_found';
                return done(null, false, {message: "The user " + user + " has not been found."});
            }
            else {
                console.log(server_prefix + " - Deserialize user " + user);
                return done(null, user);
            }
        });
        passport.use(new LocalStrategy({
            // Set the field names here
            usernameField: 'username',
            passwordField: 'password'
        },
        function(username, password, done) {
            console.log(server_prefix + " - Authenticating username " + username + " and password " + password);
            // Get the username and password from the input arguments of the function
            var user_key = '';
            var user_values = {};
            var user_not_found = true; // default to true
            // Lookup user in user list, if found set not_found to false
            for (key in user_list) {
                if(key == username) {
                    user_key = key;
                    console.log(server_prefix + " - Authenticating found user key:");
                    console.log(user_key);
                    user_values = user_list[user_key];
                    console.log(server_prefix + " - Authenticating found user values:");
                    console.log(user_values);
                    user_not_found = false;
                    break;
                }
            }//eof for
            if(user_not_found) {
                console.log(server_prefix + " - User requested, but not found: " + user);
                user = 'not_found';
                return done(null, false, {message: "The user " + user + " has not been found."});
            }
            else {
                var salt = user_values.salt;
                hash(password, salt, function (err, hash) {
                    if(err) {
                        console.log(server_prefix + " - Error: " + err);
                        return done(err);
                    }
                    hash = hash.toString('hex'); // NOTE: necessary for string comparison
                    if(hash == user_values.hash) {
                        console.log(server_prefix + " - Correct password");
                        return done(null, user_values);
                    }
                    console.log(server_prefix + " - Incorrect password");
                    return done(null, false, { message: 'Incorrect password.' });
                });
            }
        }
        ));
        // TODO:
        // passport.use(new FacebookStrategy({}));
    }
    return _Production;
};
