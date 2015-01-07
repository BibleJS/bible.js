Bible.JS
========
The Bible as a NPM module.

# Installation
```sh
$ npm install bible.js
```

I built a [command line `bible.js` client](https://github.com/BibleJS/BibleApp).
If you want to install it, run the following command:

```sh
$ sudo npm install bible -g
```

For more [information and documentation click here](https://github.com/BibleJS/BibleApp).

# Documentation
## `BibleJS.init(config, callback)`
Inits BibleJS submodules by downloading them as set in the `config` object
This method should be called before initializing the BibleJS instance.

### Params
 - **config** `Object`: The configuration object containing the following field:
    - `versions` (Object)
       - `<version_name>` (Object)
          - `source` (String): The git url of the BibleJS submodule.
          - `version` (String): The git tag or branch of the submodule.
          - `language` (String): The submodule language.

 - **callback** `Function` The callback function.

### Return
 - **BibleJS** The `BibleJS` constructor.

## `new Bible(options)`
Creates a new `Bible` instance.

### Params
* **Object** *options* An object containing the following fields:

 - `language`: the langauge of the BibleJS instance

### Return
 - **BibleJS** The `BibleJS` constructor.

## `get(reference, callback)`
This function gets the response providing the BibleJS `reference`.

### Params
- **String** `reference`: The verse reference. It can be in the following formats:
 ```
 e.g. Genesis 1:1    - returns one verse
 or Genesis 1:1,2  - returns two verses (1 and 2)
 or Genesis 1:1-10 - returns the verses 1 - 10
 or Genesis 1      - returns the whole chapter
 ```

- **Function** `callback`: The callback function.

### Return
- **BibleJS** The `BibleJS` instance (self).

## `search(query, callback)`
This function gets the verses that match to the regular expression
provided.

### Params
- **String|RegExp** `query`: The string/regular expression that matches the searched verses.
- **Function** `callback`: The callback function

### Return
- **BibleJS** The `BibleJS` instance (self)

# Example
```js
// Dependencies
var BibleJS = require("bible.js");

// Init Bible
Bible.init({
    versions: {
        en: {
            source: "https://github.com/BibleJS/bible-english"
          , version: "master"
          , language: "en"
        },
        ro: {
            source: "https://github.com/BibleJS/bible-romanian"
          , version: "master"
          , language: "ro"
        }
    }
}, function (err) {
    if (err) { throw err; }

    // Create BibleJS instances
    var enBible = new Bible({ language: "en" })
      , roBible = new Bible({ language: "ro" })
      , references = {
            en: "Psalm 1:1-6"
          , ro: "Psalmi 1:1-6"
        }
      , responseHandler = function (lang) {
            return function (err, data) {
                if (err) { throw err; }

                // Output
                if (lang) {
                    console.log(references[lang]);
                }
                console.log("-------------");

                if (data && data.length) {

                    // each verse
                    for (var i in data) {
                        console.log(data[i].verse + " | " + data[i].text);
                    }

                    console.log("-------------\n");
                }
            }
        }
      ;

    // Get verses
    enBible.get(references.en, responseHandler("en"));
    roBible.get(references.ro, responseHandler("ro"));

    // Search
    roBible.search("/meroza/gi", responseHandler());
});
```

# Testing

```sh
$ npm test
```

# Changelog
See the [releases page](https://github.com/BibleJS/bible.js/releases).

# License
See the [LICENSE](/LICENSE) file.
