// dependencies
var CSV = require("a-csv")
  , PATHS = {
        csv:  "./csv/"
      , json: "./json/"
    }
  , csvData = [
        {
            file: "carti"
          , columns: [
                "numar"
              , "carte"
            ]
        }
      , {
            file: "vdcc"
          , columns: [
                "carte"
              , "capitol"
              , "verset"
              , "tip"
              , "text"
            ]
        }
    ]
  , options = {
        delimiter: ";"
      , charset: "utf-8"
    }
  ;

/*
 *  This function converts the content from a csv file into
 *  a json array using a-csv module.
 *
 *  e.g.
 *    CSV file content:
 *      1;2;3
 *      4;5;6
 *    columns: ["column1", "column2", "column3"]
 *
 *    =>
 *      [
 *          {
 *              "column1": "1",
 *              "column2": "2",
 *              "column3": "3"
 *          },
 *          {
 *              "column1": "4",
 *              "column2": "5",
 *              "column3": "6"
 *          }
 *      ]
 * */
function csvToJson (file, columns) {

    // this will be the array generated from csv data
    var array = [];

    // start csv parsing
    CSV.parse(PATHS.csv + file + ".csv", options, function (err, row, next) {

        // handle error
        if (err) {
            return console.log(err);
        }

        // not the last row
        if (row !== null) {

            // row --> object
            var cRow = {};

            // each column from row
            for (var i = 0; i < columns.length; ++i) {

                // column --> key in object
                cRow[columns[i]] = row[i];
            }

            // push the row in the array
            array.push(cRow);

            // next row
            return next();
        }

        // show some output
        console.log("[" + new Date() + "] Saving " + file + " ...");

        // finally write the array into a file
        require("fs").writeFileSync(PATHS.json + file + ".json", JSON.stringify(array, null, 4).replace(/\\\\n/g, "\\n"));
    });
}

// each object in csv data
for (var i = 0; i < csvData.length; ++i) {

    // get the current csv data object
    var cDataObj = csvData[i];

    // convert csv to json
    csvToJson(cDataObj.file, cDataObj.columns);
}
