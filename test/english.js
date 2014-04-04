// dependencies
var Bible = new (require ("../index"))({
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
