const LANGUAGES = ["RO"];
const BOOKS_FILE_NAME = "books.json";
const VERSES_FILE_NAME = "verses.json";

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
            parsed.verses = ["ALL"];
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
            }
        }

        // item matches to the query, push it
        res.push(cItem);
    }

    // return array
    return res;
}

/**
 * private: getBookId
 *  Returns the book id providing the book name as the first parameter.
 *
 */
function getBookId (bookName) {

    // get self
    var self = this;

    // validate books
    if (!self._books || !self._books.constructor !== Array) {
        return null;
    }

    // search for book name
    var book = findQuery (self._books, {
        book: bookName
    })[0];

    // not found
    if (!book || !book.id) {
        return null;
    }

    // return book id
    return book.id;
}

var Bible = function (options) {

    // get the instance
    var self = this;

    // force options to be an object
    options = Object (options);

    // language not found
    if (LANGUAGES.indexOf(options.language) === -1) {
        throw new Error ("Language not found. Choose one of the following languages: " + LANGUAGES.join(", "));
    }

    // database configuration
    if (options.dbConfig && !options.jsonFiles) {
        throw new Error ("Not yet implemented");
    } else {
        self._json = options.jsonFiles = true;
        self._books = self._verses = {};
        self._books[options.language]  = require ("./bibles/" + options.language + "/" + BOOKS_FILE_NAME);
        self._verses[options.language] = require ("./bibles/" + options.language + "/" + VERSES_FILE_NAME);
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
        if (options.jsonFiles) {
            var bookId = getBookId.call (self, parsed.book);
            if (!bookId) { return callback ("Book not found"); }
            return findQuery (self._verses, {
                type: "SCR"
              , book: bookId
              , chapter: parsed.chapter
              , verse: parsed.verses
            });
        }
    }
};

module.exports = Bible;
