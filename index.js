const LANGUAGES = ["RO"];
const BOOKS_FILE_NAME = "books.json";
const VERSES_FILE_NAME = "verses.json";

function parseReference (reference) {

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
        case 0:

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

        // serach in JSON files
        if (options.jsonFiles) {

        }
    }
};

module.exports = Bible;
