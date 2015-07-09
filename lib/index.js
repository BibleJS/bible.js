// Dependencies
var ReferenceParser = require("bible-reference-parser")
  , RegexParser = require("regex-parser")
  , LevenshteinArray = require("levenshtein-array")
  , CallbackBuffer = require("cb-buffer")
  , Exec = require("child_process").exec
  , Git = require("git-tools")
  , Fs = require("fs")
  , Ul = require("ul")
  ;

/**
 * BibleJS
 * Creates a new `BibleJS` instance.
 *
 * @name BibleJS
 * @function
 * @param {Object} options An object containing the following fields:
 *
 *  - `language`: the langauge of the BibleJS instance (default: `"en"`).
 *
 * @return {BibleJS} The `BibleJS` instance.
 */
var BibleJS = module.exports = function (options) {

    var self = this;

    options = Ul.merge(options, {
        language: "en"
    });
    options.language = options.language.toLowerCase();

    // Language not found
    var submod = BibleJS.languages[options.language];
    if (typeof submod !== "object") {
        throw new Error ("Language not found. Use configuration object to define a BibleJS version");
    } else {
        self.language = options.language;
    }

    // Require the submodule
    self.submod = require(submod.path);

    // Cache the responses
    self.cache = {};

    /**
     * get
     * This function gets the response providing the BibleJS `reference`.
     *
     * @name get
     * @function
     * @param {String} reference The verse reference. It can be in the following formats:
     *
     *  ```
     *  e.g. Genesis 1:1  - returns one verse
     *  or Genesis 1:1,2  - returns two verses (1 and 2)
     *  or Genesis 1:1-10 - returns the verses 1 - 10
     *  or Genesis 1      - returns the whole chapter
     *  ```
     *
     * @param {Function} callback The callback function.
     * @return {BibleJS} The BibleJS instance (self).
     */
    self.get = function (reference, callback) {

        // Handle callback buffering
        var cBuffer = self.cache[reference];
        if (cBuffer) {
            if (cBuffer.isDone) {
                cBuffer.done(callback);
            }
            cBuffer.add(callback);
            return self;
        }


        // Parse reference and init request
        var parsedReference = ReferenceParser(reference)
          , request = {
                instance: self
              , reference: reference
              , p_reference: parsedReference
            }
          ;

        // Cache the buffer
        cBuffer = self.cache[reference] = new CallbackBuffer();
        cBuffer.add(callback);
        cBuffer.wait();

        function getVerse() {
            self.submod.getVerse.call(
                request
              , request.p_reference
              , function (err, verses) {
                    for (var i = 0; i < verses.length; ++i) {
                        verses[i].text = verses[i].text.replace(/<\/?[^>]+(>|$)/g, "");
                    }
                    cBuffer.callback(err, verses);
                }
            );
        }

        // Compute book using Levenshtein distance
        if (typeof self.submod.getBooks === "function") {
            self.submod.getBooks.call(request, function (err, books) {
                if (err) { return callback(err); }
                request.p_reference.book = LevenshteinArray(
                    books, request.p_reference.book
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
     * @return {BibleJS} The BibleJS instance (self)
     */
    self.search = function (query, callback) {

        if (query && query.constructor === String) {
            query = new RegexParser(query);
        }

        if (!query || query.constructor !== RegExp) {
            return callback("query must be a regular expression or a string");
        }

        var request = {
            instance: self
          , query: query
        };

        if (typeof self.submod.search === "function") {
            self.submod.search.call(request, query, callback);
        } else {
            callback("Module don't support search method");
        }

        return self;
    };
};

/**
 * init
 * Inits BibleJS submodules by downloading them as set in the `config` object
 * This method should be called before initializing the BibleJS instance.
 *
 * @name init
 * @function
 * @param {Object} config The configuration object containing the following field:
 *
 *  - `versions` (Object)
 *     - `<version_name>` (Object)
 *        - `source` (String): The git url of the BibleJS submodule.
 *        - `version` (String): The git tag or branch of the submodule.
 *        - `language` (String): The submodule language.
 *
 * @param {Function} callback The callback function.
 * @return {BibleJS} The BibleJS constructor.
 */
BibleJS.init = function initBibleJS (config, callback) {

    var versions = Object(config.versions)
      , bibleDirectory = Ul.home() + "/.bible"
      ;

    // Create ~/.bible directory
    if (!Fs.existsSync(bibleDirectory)) {
        Fs.mkdir(bibleDirectory, function(err) {
            if (err) { return callback(err); }
            initBibleJS(config, callback);
        });
        return BibleJS;
    }

    BibleJS.languages = {};

    var complete = 0
      , howMany = Object.keys(versions).length
      ;

    if (!howMany) {
        callback("No BibleJS versions are installed");
        return BibleJS;
    }

    function install(cV, mod) {
        var versionPath =  bibleDirectory + "/" + mod;

        BibleJS.languages[cV.language] = {
            version: cV
          , path: versionPath
        };

        if (Fs.existsSync(versionPath)) {
            if (++complete === howMany) {
                return callback(null, versions);
            }
            return;
        }

        // Clone BibleJS version
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
    }

    // Install BibleJS versions
    for (var mod in versions) {
        install(versions[mod], mod);
    }

    return BibleJS;
};
