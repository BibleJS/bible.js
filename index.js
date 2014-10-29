/**
 *  BibleJS
 *  Access the Bible contents from JavaScript side.
 *
 *  </> with <3 by Ionică Bizău
 *  Licensed under the MIT license.
 *
 * */

// Dependencies
var ReferenceParser = require("bible-reference-parser")
  , Git = require("git-tools")
  , Fs = require("fs")
  , RegexParser = require("regex-parser")
  , Exec = require("child_process").exec
  , LevenshteinArray = require("levenshtein-array")
  ;

/**
 * getUserHome
 * Returns the path to home directory.
 *
 * @name getUserHome
 * @function
 * @return {String} Absolute path to user home directory'
 */
function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

// Constructor
var Bible = function (options) {

    var self = this;
    options = Object(options);
    options.language = String(options.language || "").toLowerCase();

    // Language not found
    var _submod = Bible.languages[options.language];
    if (typeof _submod !== "object") {
        throw new Error ("Language not found. Use configuration object to define a Bible version");
    } else {
        self._language = options.language;
    }

    self._submod = require(_submod.path);

    /**
     * get
     * This function gets a verse/chapter etc providing the `reference`
     *
     * @name get
     * @function
     * @param {String} reference The verse reference. It can be in the following formats:
     *  e.g. Genesis 1:1    - returns one verse
     *    or Genesis 1:1,2  - returns two verses (1 and 2)
     *    or Genesis 1:1-10 - returns the verses 1 - 10
     *    or Genesis 1      - returns the whole chapter
     * @param {Function} callback The callback function
     * @return {Bible} The Bible instance (self)
     */
    self.get = function (reference, callback) {

        // Parse reference and init request
        var parsedReference = ReferenceParser(reference)
          , request = {
                instance: self
              , reference: reference
              , pReference: parsedReference
            }
          ;

        function getVerse() {
            self._submod.getVerse.call(
                request
              , request.pReference
              , callback
            );
        }

        // Compute book using Levenshtein distance
        if (typeof self._submod.getBooks === "function") {
            self._submod.getBooks.call(request, function (err, books) {
                if (err) { return callback(err); }
                request.pReference.book = LevenshteinArray(
                    books, request.pReference.book
                )[0].w;
                getVerse();
            });
            return self;
        }

        getVerse();
        return self;
    };

    /**
     * search
     * This function gets the verses that match to the regular expression
     * provided.
     *
     * @name search
     * @function
     * @param {String|RegExp} query The string/regular expression that matches
     * the searched verses.
     * @param {Function} callback The callback function
     * @return {Bible} The Bible instance (self)
     */
    self.search = function (query, callback) {

        if (query && query.constructor === String) {
            query = new RegexParser.parse(query);
        }

        if (!query || query.constructor !== RegExp) {
            return callback("query must be a regular expression or a string");
        }

        var request = {
            instance: self
          , query: query
        };

        if (typeof self._submod.search === "function") {
            self._submod.search.call(request, query, callback);
        } else {
            callback("Module don't support search method");
        }

        return self;
    }
};

/**
 * init
 * Inits BibleJS module by downloading versions set in configuration
 * This method should be called when the application is started.
 *
 * @name init
 * @function
 * @param {Object} config BibleJS configuration object. It must contain
 * `versions` field as noted in documentation.
 * @param {Function} callback The callback function
 * @return {Bible} Bible constructor
 */
Bible.init = function initBible (config, callback) {

    var versions = Object(config.versions)
      , bibleDirectory = getUserHome() + "/.bible"
      ;

    // Create ~/.bible directory
    if (!Fs.existsSync(bibleDirectory)) {
        Fs.mkdir(bibleDirectory, function(err) {
            if (err) { return callback(err); }
            initBible(config, callback);
        });
        return Bible;
    }

    Bible.languages = {};

    var complete = 0
      , howMany = Object.keys(versions).length
      ;

    if (!howMany) {
        callback("No Bible versions are installed");
        return Bible;
    }

    // Install Bible versions
    for (var mod in versions) {
        (function (cV, mod) {
            var versionPath =  bibleDirectory + "/" + mod;
            Bible.languages[cV.language] = {
                version: cV
              , path: versionPath
            };
            if (Fs.existsSync(versionPath)) {
                if (++complete === howMany) {
                    return callback(null, versions);
                }
                return;
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

                    Exec("npm install", {
                        cwd: versionPath
                    }, function (err) {
                        if (err) { return callback(err); }
                        if (++complete !== howMany) { return; }
                        callback(null, versions);
                    });
                });
            });
        })(versions[mod], mod);
    }

    return Bible;
};

// export it
module.exports = Bible;
