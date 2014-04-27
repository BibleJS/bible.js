/**
 *  BibleJS
 *  Access the Bible contents from JavaScript side.
 *
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2014 Ionică Bizău
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of
 *  this software and associated documentation files (the "Software"), to deal in
 *  the Software without restriction, including without limitation the rights to
 *  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 *  the Software, and to permit persons to whom the Software is furnished to do so,
 *  subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 *  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 *  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 *  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 *  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * */

const LANGUAGES = ["RO", "EN"];
const VERSES_FILE_NAME = "verses.json";
var Request = require ("request");

/**
 * private: parseReference
 *  This function parses the provided reference.
 *
 *  Arguments
 *    @reference: string in the following formats
 *      <book> <chapter>:<verse>
 *      <book> <chapter>:<firstVerse>-<lastVerse>
 *      <book> <chapter>:<oneVerse>,<anotherVerse>
 *      <book> <chapter>
 *
 *  Returns
 *    an object in the following format:
 *      {
 *         boook: "<book>"
 *       , chapter: "<chapter>"
 *       , verses: ["...", "..."]
 *      }
 *
 */
function parseReference (reference) {

    // this object will be returned
    var parsed = {
        book: null
      , chapter: null
      , verses: []
    };

    // TODO regexp
    parsed.book = reference.substring(0, reference.lastIndexOf(" "));

    // get chapter and verses
    var chapterAndVerses = reference.substring(reference.lastIndexOf(" ") + 1)
      , splits = chapterAndVerses.split(":")
      ;

    // compute
    switch (splits.length) {
        // chapter and verses provided
        case 2:

            // set the chapter
            parsed.chapter = splits[0];

            // get verses
            var verses = splits[1].split(/\-|\,/)

                // parse first and last verse
              , first = parseInt(verses[0])
              , last = parseInt(verses[1])
              ;

            // e.g. 1-10
            if (splits[1].indexOf("-") !== -1) {

                // push all verses
                for (var i = first; i <= last; ++i) {
                    parsed.verses.push(i.toString());
                }
            } else {
               parsed.verses = verses;
            }
            break;

        // chapter only
        case 1:

            // set the chapter
            parsed.chapter = splits[0];

            // take all verses
            parsed.verses = "ALL";
            break;
        default:
            return null;
    }

    return parsed;
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

        var parsed = parseReference (reference);
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
    }

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
