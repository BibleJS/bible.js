// dependencies
var Bible = require ("../index");

// get verse
Bible.get("Geneza 1:1", function (err, data) {
    console.log (err || data);
});
