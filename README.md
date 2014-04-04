bible.js
========

The Bible as a NPM module.

## How to use
```js
// dependencies
var Bible = new (require ("bible.js"))({
    language: "RO"
});

// get verse
Bible.get("Psalmii 1:1-6", function (err, data) {
    if (data && data.length) {
        for (var i in data)
        console.log(data[i].verse + " | " + data[i].text);
    }
});
```

## Changelog

### `v0.1.1`
 - use Bible data v0.1.1

### `v0.1.0`
 - initial release

## License
See LICENSE file.
