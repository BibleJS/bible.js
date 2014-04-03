// dependencies
var Bible = new (require ("../index"))({
    language: "RO"
});

// get verse
Bible.get("Geneza 1:1", function (err, data) {
    console.log (err || data);
});
