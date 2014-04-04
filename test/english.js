// dependencies
var Bible = new (require ("../index"))({
    language: "EN"
})
  , reference = "Psalm 1:1-6"
  ;

console.log(reference);
console.log("-------------");

// get verse
Bible.get(reference, function (err, data) {
    if (data && data.length) {
        for (var i in data)
        console.log(data[i].verse + " | " + data[i].text);
        console.log("-------------\n");
    }
});
