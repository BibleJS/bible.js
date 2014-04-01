var VDDC = require ("./json/vdcc");

for (var i = 0; i < VDDC.length; ++i) {
    var cVDDC = VDDC[i];
    cVDDC.text = cVDDC.text.replace(/<\/?[^>]+(>|$)/g, "").replace(/\*/g, "");
}

require("fs").writeFileSync("./json/vdcc.json", JSON.stringify(VDDC, null, 4));
