Bible.js
========

The Bible as a NPM module.

# Installation
```sh
$ npm install bible.js
```
I build a [`bible.js` based application](https://github.com/BibleJS/BibleApp) that runs in Terminal. If you want to install it, run the following command:

```sh
$ sudo npm install bible -g
```

For more information and documentation click [here](https://github.com/BibleJS/BibleApp).

# Methods

## `new Bible(options)`
Creates a new `Bible` instance

### Params
* **Object** *options* An object containing the following fields:

 - `language`: the langauge of the Bible instance

## `myBible.get(reference, callback)`
This function gets a verse/chapter etc providing the `reference`

### Params:
* **String** *reference* The verse reference. It can be in the following formats:

  - Genesis 1:1    - returns one verse
  - Genesis 1:1,2  - returns two verses (1 and 2)
  - Genesis 1:1-10 - returns the verses 1 - 10
  - Genesis 1      - returns the whole chapter

* **Function** *callback* The callback function

### Return:
* **Bible** The Bible instance (self)

## `search(query, callback)`
This function gets the verses that match to the regular expression
provided.

### Params:
* **String|RegExp** *query* The string/regular expression that matches the searched verses.
* **Function** *callback* The callback function

### Return:
* **Bible** The Bible instance (self)

## `init(config, callback)`
Inits BibleJS module by downloading versions set in configuration
This method should be called when the application is started.

### Params:
* **Object** *config* BibleJS configuration object. It must contain `versions` field as noted in documentation.
* **Function** *callback* The callback function

### Return:
* **Bible** Bible constructor


# Example
```js
// Dependencies
var Bible = require("../index");

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

    // Create Bible instances
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

## Testing

```sh
$ npm test

> bible.js@1.0.0 test /home/ionicabizau/Documents/BibleApp/node_modules/bible.js
> node test/index

Psalmi 1:1-6
-------------
1 | Ferice de omul care nu se duce la sfatul celor răi, nu se opreşte pe calea celor păcătoşi şi nu se aşază pe scaunul celor batjocoritori!
2 | Ci îşi găseşte plăcerea în Legea Domnului, şi zi şi noapte cugetă la Legea Lui!
3 | El este ca un pom sădit lângă un izvor de apă, care îşi dă rodul la vremea lui şi ale cărui frunze nu se veştejesc: tot ce începe, duce la bun sfârşit.
4 | Nu tot aşa este cu cei răi: ci ei sunt ca pleava pe care o spulberă vântul.
5 | De aceea cei răi nu pot ţine capul sus în ziua judecăţii, nici păcătoşii în adunarea celor neprihăniţi.
6 | Căci Domnul cunoaşte calea celor neprihăniţi, dar calea păcătoşilor duce la pieire.
-------------

-------------
23 | Blestemaţi pe Meroza, a zis Îngerul Domnului, blestemaţi, blestemaţi pe locuitorii lui; căci n-au venit în ajutorul Domnului, în ajutorul Domnului, printre oamenii viteji.
-------------

Psalm 1:1-6
-------------
1 | How blessed is the one who does not follow the advice of the wicked, or stand in the pathway with sinners, or sit in the assembly of scoffers!
2 | Instead he finds pleasure in obeying the Lord’s commands; he meditates on his commands day and night.
3 | He is like a tree planted by flowing streams; it yields its fruit at the proper time, and its leaves never fall off. He succeeds in everything he attempts.
4 | Not so with the wicked! Instead they are like wind-driven chaff.
5 | For this reason the wicked cannot withstand judgment, nor can sinners join the assembly of the godly.
6 | Certainly the Lord guards the way of the godly, but the way of the wicked ends in destruction.
-------------
```

# Changelog

## `1.0.3`
 - Fixed search feature

## `1.0.2`
 - Updated `regex-parser` depdendency

## `1.0.1`
 - Minor changes

## `1.0.0`
 - First stable release with a lot of improvements
 - Support custom language submodules (everyone can build one) via `git` and `npm`

## `v0.1.7`
 - Added `search` method
 - Removed `mongodb` as dependency

## `v0.1.6`
 - Updated GitHub urls and email address

## `v0.1.5`
 - Convert to uppercase the language field

## `v0.1.4`
 - Get all verses from a chapter (bug when language is RO).

## `v0.1.3`
 - Removed `_books` field.
 - Use the new version of [Bible Data](https://github.com/BibleJS/Versions)

## `v0.1.2`
 - added English support using providers

## `v0.1.1`
 - use Bible data v0.1.1

## `v0.1.0`
 - initial release

# License
See LICENSE file.
