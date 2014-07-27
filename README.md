Bible.js
========

The Bible as a NPM module.

## Installation
```sh
$ npm install bible.js
```
I build a [`bible.js` based application](https://github.com/BibleJS/BibleApp) that runs in Terminal. If you want to install it, run the following command:

```sh
$ sudo npm install bible -g
```

For more information and documentation click [here](https://github.com/BibleJS/BibleApp).

## Methods

### Constructor: `new Bible (options)`
Creates a new `Bible` instance.

#### Arguments

 - `@options` object containing:
   - `language`: the language (currently the supported languages are Romanian (`"RO"`) and English (`"EN"`)

#### Example

```js
var Bible = new (require ("bible.js"))({
    language: "EN"
})
```

### `Bible.get (reference, callback)`
This function gets the verses/chapter represented by `@reference` argument. The `@callback` function is called with an error and an array of verses (objects).

#### Arguments
  - `@reference`: a string in the following formats:
    e.g. Genesis 1:1    - returns one verse
      or Genesis 1:1,2  - returns two verses (1 and 2)
      or Genesis 1:1-10 - returns the verses 1 - 10
      or Genesis 1      - returns the whole chapter

  - `@callback`: the callback function

#### Example

```js
Bible.get("Psalm 1:1-6", function (err, data) {
    /* do something */
});
```

### `Bible.search (query, callback)`
The method receives a string or a regular expression in the first argument (`@query`). The verses that match the query are fetched.
**NOTE**: right now only searching in json files is implemented.

#### Arguments
 - `@query`: string or regular expression
 - `@callback`: the callback function

#### Example

```js
Bible.search(/david/i, function (err, verses) {
   /* do something with the verses that contain "david" */
});
```

## Example
```js
// dependencies
var Bible = new (require ("bible.js"))({
    language: "EN"
})

    // the Bible reference
  , reference = "Psalm 1:1-6"
  ;

// output
console.log(reference);
console.log("-------------");

// get verse
Bible.get(reference, function (err, data) {

    // we've get the verses
    if (data && data.length) {

        // each verse
        for (var i in data) {

            // output
            console.log(data[i].verse + " | " + data[i].text);
        }

        // output
        console.log("-------------\n");
    }
});
```

### Testing

```sh
$ npm test

> bible.js@0.1.1 test /home/.../bible.js
> node test/english

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

## Changelog

### `1.0.0`
 - First stable release with a lot of improvements
 - Support custom language submodules (everyone can build one) via `git` and `npm`

### `v0.1.7`
 - Added `search` method
 - Removed `mongodb` as dependency

### `v0.1.6`
 - Updated GitHub urls and email address

### `v0.1.5`
 - Convert to uppercase the language field

### `v0.1.4`
 - Get all verses from a chapter (bug when language is RO).

### `v0.1.3`
 - Removed `_books` field.
 - Use the new version of [Bible Data](https://github.com/BibleJS/Versions)

### `v0.1.2`
 - added English support using providers

### `v0.1.1`
 - use Bible data v0.1.1

### `v0.1.0`
 - initial release

## License
See LICENSE file.
