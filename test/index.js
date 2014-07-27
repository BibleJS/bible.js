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
                console.log(references[lang]);
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
});
