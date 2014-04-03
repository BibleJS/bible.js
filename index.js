const LANGUAGES = ["RO"];
const BOOKS_FILE_NAME = "books.json";
const VERSE_FILE_NAME = "verses.json";

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
        self._books = {};
        self._books[options.language]  = require ("./data/json/" + options.language + "/" + BOOK_FILE_NAME);
        self._verses[options.language] = require ("./data/json/" + options.language + "/" + VERSE_FILE_NAME);
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

        console.log(reference)

        // serach in JSON files
        if (options.jsonFiles) {

        }
    }
};

module.exports = Bible;
