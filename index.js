/**
 *  BibleJS
 *  Access the Bible contents from JavaScript side.
 *
 *  </> with <3 by Ionică Bizău
 *  Licensed under the MIT license.
 *
 * */

// constants
const LANGUAGES = ["RO", "EN"];
const VERSES_FILE_NAME = "verses.json";

// dependencies
var Request = require ("request")
  , ReferenceParser = require("bible-reference-parser")
  , Git = require("git-tools")
  , Fs = require("fs")
  ;

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

/*
 *  This function searches returns the objects from an array
 *  that contains objects
 *
 *  {
 *      site_id: "61",
 *      name: "18"
 *  }
 *
 * */
function findQuery (array, query) {

    // get the collection
    var col = array
      , res = []
      ;

    // array empty or not valid
    if (!col || !col.length || col.constructor !== Array) {
        return res;
    }

    // start dance
    itemsToFindForLoop:

    // each item
    for (var i = 0; i < col.length; ++i) {

        // get current item
        var cItem = col[i];

        // each filter from query
        for (var f in query) {

            // get filter value
            var fValue = query[f];

            if (typeof cItem[f] === "string" && typeof fValue === "string") {
                // a filter doesn't match to the query
                if (cItem[f] !== fValue) continue itemsToFindForLoop;
            } else if (typeof cItem[f] === "string" &&  fValue && fValue.constructor === Array) {
                // a filter doesn't match to the query
                if (fValue.indexOf(cItem[f]) === -1) continue itemsToFindForLoop;
            } else if (typeof cItem[f] === "string" &&  fValue && fValue.constructor === RegExp) {
                // a filter doesn't match to the query
                if (!fValue.test(cItem[f])) continue itemsToFindForLoop;
            }
        }

        // item matches to the query, push it
        res.push(cItem);
    }

    // return array
    return res;
}

// constructor
var Bible = function (options) {

    // get the instance
    var self = this;

    // force options to be an object
    options = Object (options);

    // uppercase the language field
    options.language = String (options.language).toUpperCase();

    // language not found
    if (LANGUAGES.indexOf(options.language) === -1) {
        throw new Error ("Language not found. Choose one of the following languages: " + LANGUAGES.join(", "));
    } else {
        self._language = options.language;
    }

    // database configuration
    if (options.dbConfig && !options.jsonFiles) {
        throw new Error ("Not yet implemented");
    } else {

        // use json files
        self._json = options.jsonFiles = true;

        // create the verse object
        self._verses = {};

        try {
            // require the json files
            self._verses[options.language] = require ("./bibles/" + options.language + "/" + VERSES_FILE_NAME);
        } catch (e) {
            self._useRequest = true;
            // TODO
            var providers = {
                "EN": [
                    "http://libbible.com/api/query.php?type=verse&br="
                  , "http://labs.bible.org/api/?type=json&passage="
                ]
            };
            // TODO
            self._provider = providers[self._language][1];
        }
    }

    /**
     *  This function gets a verse/chapter etc providing the @reference
     *
     *  Arguments
     *    @reference: a string in the following formats:
     *      e.g. Genesis 1:1    - returns one verse
     *        or Genesis 1:1,2  - returns two verses (1 and 2)
     *        or Genesis 1:1-10 - returns the verses 1 - 10
     *        or Genesis 1      - returns the whole chapter
     *
     *    @callback: the callback function
     *
     */
    self.get = function (reference, callback) {

        var parsed = ReferenceParser(reference);
        if (!parsed) { return callback ("Cannot parse the input."); }

        // serach in JSON files
        if (self._json && !self._useRequest) {

            // build the query
            var query = {
                bookname:   parsed.book
              , chapter:    parsed.chapter
              , verse:      parsed.verses
            };

            // "ALL" is special
            if (query.verse === "ALL") {
                delete query.verse;
            }

            // send the response
            callback (null, findQuery (self._verses[self._language], query));

            // return the instance
            return self;
        }

        // use request
        if (self._json && self._useRequest) {

            // run request
            Request.get({
                json: true
              , url: self._provider + reference
            }, function (err, response, body) {

                // handle error
                if (err || response.statusCode !== 200) {
                    return callback (err || response.message);
                }

                // callback response
                callback (null, body);
            });

            // return the instance
            return self;
        }
    };

    /**
     * init
     * Inits BibleJS module by downloading versions set in configuration
     *
     * @name init
     * @function
     * @param {Object} config BibleJS configuration object. It must contain
     * `versions` field as noted in documentation.
     * @param {Function} callback The callback function
     * @return
     */
    self.init = function (config, callback) {

        var versions = Object(config.versions)
          , bibleDirectory = getUserHome() + "/.bible"
          ;

        // Create ~/.bible directory
        if (!Fs.existsSync(bibleDirectory)) {
            return fs.mkdir(path, function(err) {
                if (err) { return callback(err); }
                self.init(config, callback);
            });
        }

        var complete = 0
          , howMany = Object.keys(versions).length
          ;

        if (!howMany) {
            return callback("No Bible versions are installed");
        }

        // Install Bible versions
        for (var mod in versions) {
            (function (cV, mod) {
                var versionPath =  bibleDirectory + "/" + mod;
                if (Fs.existsSync(versionPath)) {
                    if (++complete === howMany) {
                        return callback(null, versions);
                    }
                }

                // Clone Bible version
                Git.clone({
                    repo: cV.source
                  , dir: versionPath
                  , depth: 1
                }, function (err, repository) {
                    if (err) { return callback(err); }

                    // Set version/branch
                    repository.exec("checkout", cV.version, function (err, output) {
                        if (err) { return callback(err); }

                        // Get package.json file
                        var packageJson = require(versionPath + "/package.json")
                          , deps = packageJson.dependencies || {}
                          , packages = []
                          ;

                        for (var d in deps) {
                            packages.push(d + "@" + deps[d]);
                        }

                        // Install version dependencies
                        Npm.load({prefix: versionPath + "/node_modules"}, function (err) {
                            if (err) { return callback(err); }
                            Npm.commands.install(packages, function (err, data) {
                                if (err) { return callback(err); }
                                if (++complete !== howMany) { return; }
                                callback(null, versions);
                            });
                        });
                    });
                });
            })(versions[mod], mod);
        }
    };

    /**
     *  This function gets the verses that match to the regular expression provided
     *
     *  Arguments
     *    @reference: a string or regular expression
     *    @callback: the callback function
     *
     */
    self.search = function (query, callback) {

        // validate
        if (query && query.constructor === String) {
            query = new RegExp (query);
        }

        if (!query || query.constructor !== RegExp) {
            throw new Error ("query must be a regular expression or a string");
        }

        // serach in JSON files
        if (self._json && !self._useRequest) {

            // build the query
            var query = {
                text: query
            };

            // send the response
            callback (null, findQuery (self._verses[self._language], query));

            // return the instance
            return self;
        }
    }
};

// export it
module.exports = Bible;
