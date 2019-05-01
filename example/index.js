const Bible = require("../lib");

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
}, err => {
    if (err) { throw err; }

    // Create Bible instances
    const displayVerses = lang => {
        return (err, data) => {
            if (err) { throw err; }

            console.log("-------------");

            (data || []).forEach(c => {
                console.log(c.verse + " | " + c.text);
            })

            console.log("-------------\n");
        }
    }

    // Get a specific Bible verse in English
    const enBible = new Bible({ language: "en" })
    enBible.get("Psalm 1:1-6", displayVerses("en"));

    // Get a specific Bible verse in Romanian
    const roBible = new Bible({ language: "ro" })
    roBible.get("Psalmii 1:1-6", displayVerses("ro"));

    // Search
    roBible.search("/meroza/gi", displayVerses("ro"));
});
