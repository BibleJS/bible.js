// dependencies
var Bible = new (require ("../index"))({
    language: "RO"
});

// get verse
Bible.get("Maleahi 4:1-4", function (err, data) {
    if (data && data.length) {
        for (var i in data)
        console.log(data[i].verse + " | " + data[i].text);
    }
});
