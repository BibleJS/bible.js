// dependencies
var Bible = new (require ("../index"))({
    language: "EN"
});

// get verse
Bible.get("Psalm 1:1-6", function (err, data) {
    if (data && data.length) {
        for (var i in data)
        console.log(data[i].verse + " | " + data[i].text);
    }
});
