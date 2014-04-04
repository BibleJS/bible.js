Bible.js
========

The Bible as a NPM module.

## Installation
```sh
$ npm install bible.js
```

## How to use
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

### `v0.1.2`
 - added English support using providers

### `v0.1.1`
 - use Bible data v0.1.1

### `v0.1.0`
 - initial release

## License
See LICENSE file.
