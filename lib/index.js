"use strict"

const referenceParser = require("bible-reference-parser")
    , regexParser = require("regex-parser")
    , levenshteinArray = require("levenshtein-array")
    , cbBuffer = require("cb-buffer")
    , exec = require("child_process").exec
    , git = require("git-tools")
    , fs = require("fs")
    , ul = require("ul")
    , isThere = require("is-there")
    , abs = require("abs")
    , oneByOne = require("one-by-one")
    , bindy = require("bindy")


class BibleJS {

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
     * @param {Function} cb The cb function.
     * @return {BibleJS} The BibleJS constructor.
     */
    static init (config, cb) {

        const versions = Object(config.versions)
            , bibleDirectory = abs("~/.bible")

        // Create ~/.bible directory
        if (!isThere(bibleDirectory)) {
            fs.mkdir(bibleDirectory, err => {
                if (err) { return cb(err) }
                BibleJS.init(config, cb)
            })
            return BibleJS
        }

        BibleJS.languages = {}

        const howMany = Object.keys(versions).length

        if (!howMany) {
            cb(new Error("No BibleJS versions are installed"))
            return BibleJS
        }

        const installVersion = (cV, mod, next) => {
            const versionPath =  bibleDirectory + "/" + mod

            BibleJS.languages[cV.language] = {
                version: cV
              , path: versionPath
            }

            // Check if installed already
            if (isThere(versionPath)) {
                return next()
            }

            oneByOne([
                // 1. Clone BibleJS version
                n => git.clone({
                        repo: cV.source
                      , dir: versionPath
                      , depth: 1
                    }, n)

                // 2. Set version/branch
              , (n, repository) => repository.exec("checkout", cV.version, n)

                // 3. Do `npm install`
              , n => exec("npm install --production", { cwd: versionPath }, n)
            ], err => next(err, versions))
        }

        oneByOne(
            bindy(
                Object.keys(versions),
                (cLang, next) => installVersion(versions[cLang], cLang, next)
            )
          , cb
        )

        return BibleJS
    }

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
    constructor (options) {
        options = ul.merge(options, {
            language: "en"
        })

        options.language = options.language.toLowerCase()

        // Language not found
        const submod = BibleJS.languages[options.language]
        if (typeof submod !== "object") {
            throw new Error("Language not found. Use configuration object to define a BibleJS version")
        } else {
            this.language = options.language
        }

        // Require the submodule
        this.submod = require(submod.path)

        // Cache the responses
        this.cache = {}
    }

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
     * @param {Function} cb The cb function.
     * @return {BibleJS} The BibleJS instance (this).
     */
    get (reference, cb) {

        // Handle cb buffering
        let cBuffer = this.cache[reference]
        if (cBuffer) {
            if (cBuffer.isDone) {
                cBuffer.done(cb)
            }
            cBuffer.add(cb)
            return this
        }


        // Parse reference and init request
        const parsedReference = referenceParser(reference)
            , request = {
                  instance: this
                , reference: reference
                , p_reference: parsedReference
              }

        // Cache the buffer
        cBuffer = this.cache[reference] = new cbBuffer()
        cBuffer.add(cb)
        cBuffer.wait()

        const getVerse = () => {
            this.submod.getVerse.call(
                request
              , request.p_reference
              , function (err, verses) {
                    for (var i = 0; i < verses.length; ++i) {
                        verses[i].text = verses[i].text.replace(/<\/?[^>]+(>|$)/g, "")
                    }
                    cBuffer.callback(err, verses)
                }
            )
        }

        // Compute book using Levenshtein distance
        if (typeof this.submod.getBooks === "function") {
            this.submod.getBooks.call(request, (err, books) => {
                if (err) { return cb(err) }
                request.p_reference.book = levenshteinArray(
                    books, request.p_reference.book
                )[0].w
                getVerse()
            })
        } else {
            getVerse()
        }

        return this
    }

    /**
     * search
     * This function gets the verses that match to the regular expression
     * provided.
     *
     * @name search
     * @function
     * @param {String|RegExp} query The string/regular expression that matches
     * the searched verses.
     * @param {Function} cb The cb function
     * @return {BibleJS} The BibleJS instance (this)
     */
    search (query, cb) {
        if (query && typeof query === "string") {
            query = new regexParser(query)
        }

        if (!query || query.constructor !== RegExp) {
            return cb("query must be a regular expression or a string")
        }

        const request = {
            instance: this
          , query: query
        }

        if (typeof this.submod.search === "function") {
            this.submod.search.call(request, query, cb)
        } else {
            cb("Module don't support searching")
        }

        return this
    }
}

module.exports = BibleJS
