// dependencies
var Bible = new (require ("../index"))({
        language: "RO"
    });

// get verse
Bible.search(/meroza/i, function (err, data) {

    if (data && data.length) {
        for (var i in data) {
            console.log (
                data[i].bookname + " " + data[i].chapter + " " + data[i].verse + " | "
              + data[i].text
            );
        }
    }
});
