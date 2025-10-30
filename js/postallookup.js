// branch code and mappings organized and collected by ChatGpt
const branchMappings = {
    "AB": "Albion",
    "AC": "Albert Campbell",
    "AD": "Alderwood",
    "AG": "Agincourt",
    "AH": "Armour Heights",
    "AN": "Annette Street",
    "AP": "Amesbury Park",
    "BB": "Beaches",
    "BC": "Black Creek",
    "BD": "Bendale",
    "BF": "Barbara Frum",
    "BG": "Bloor/Gladstone",
    "BK": "Brookbanks",
    "BR": "Bridlewood",
    "BRW": "Brentwood",
    "BUR": "Burrows Hall",
    "CC": "Centennial",
    "CE": "Cedarbrae",
    "CF": "Cliffcrest",
    "CHL": "City Hall",
    "CL": "College/Shaw",
    "DA": "Danforth/Coxwell",
    "DGH": "Daniel G. Hill",
    "DE": "Deer Park",
    "DM": "Don Mills",
    "DO": "Downsview",
    "DP": "Davenport",
    "DR": "Dawes Road",
    "DSC": "Dufferin/St. Clair",
    "EB": "Elmbrook Park",
    "EG": "Evelyn Gregory",
    "EHN": "Ethennonnhawahstihnen'",
    "EN": "Eatonville",
    "ES": "Eglinton Square",
    "FH": "Forest Hill",
    "FO": "Fort York",
    "FP": "Flemingdon Park",
    "FV": "Fairview",
    "GA": "Gerrard/Ashdale",
    "GHP": "Goldhawk Park",
    "GW": "Guildwood",
    "HB": "Humber Bay",
    "HC": "Highland Creek",
    "HI": "Hillcrest",
    "HP": "High Park",
    "HS": "Humber Summit",
    "HW": "Humberwood",
    "JO": "Jones",
    "JS": "Jane/Sheppard",
    "JT": "Junction Triangle",
    "KE": "Kennedy/Eglinton",
    "LB": "Long Branch",
    "LE": "Leaside",
    "LHS": "Lillian H. Smith",
    "LO": "Locke",
    "MA": "Maryvale",
    "MAL": "Malvern",
    "MAS": "Maria A. Shchuka",
    "MC": "Mimico Centennial",
    "MD": "Mount Dennis",
    "MO": "Morningside",
    "MP": "McGregor Park",
    "MS": "Main Street",
    "MTP": "Mount Pleasant",
    "ND": "Northern District",
    "NE": "Northern Elms",
    "NT": "New Toronto",
    "NYC": "North York Central Library",
    "OV": "Oakwood Village Library & Arts Centre",
    "PA": "Palmerston",
    "PD": "Pape/Danforth",
    "PK": "Parkdale",
    "PLS": "Parliament Street",
    "PU": "Port Union",
    "PV": "Pleasant View",
    "QS": "Queen/Saulter",
    "RX": "Rexdale",
    "RI": "Richview",
    "RN": "Runnymede",
    "RV": "Riverdale",
    "SA": "Sanderson",
    "SCC": "Scarborough Civic Centre",
    "SCS": "St. Clair/Silverthorn",
    "SD": "Sanderson",
    "SJ": "St. James Town",
    "SL": "St. Lawrence",
    "SM": "Swansea Memorial",
    "SP": "Spadina Road",
    "ST": "Steeles",
    "SWS": "S. Walter Stewart",
    "TH": "Thorncliffe",
    "TM": "Taylor Memorial",
    "TR": "Todmorden Room",
    "TRL": "Toronto Reference Library",
    "VV": "Victoria Village",
    "WE": "Weston",
    "WS": "Woodside Square",
    "WV": "Woodview Park",
    "WY": "Wychwood",
    "YO": "Yorkville",
    "YW": "York Woods"
}

const postalToBranch = {
    // SCARBOROUGH (M1)
    "M1B": ["BUR", "MAL"],
    "M1C": ["HC", "PU"],
    "M1E": ["GW", "MO"],
    "M1J": ["BD"],
    "M1K": ["AC", "KE"],
    "M1L": ["ES"],
    "M1M": ["CF"],
    "M1N": ["TM"],
    "M1P": ["MP", "SCC"],
    "M1R": ["MA"],
    "M1T": ["AG"],
    "M1V": ["WS", "GHP"],
    "M1W": ["BR", "ST"],
    // NORTH YORK (M2)
    "M2H": ["HI"],
    "M2J": ["FV", "PV"],
    "M2K": ["EHN"],
    "M2N": ["NYC"],
    "M2R": ["CC"],
    // NORTH YORK (M3)
    "M3A": ["BK"],
    "M3C": ["DM", "FP"],
    "M3L": ["BC", "JS"],
    "M3M": ["DO"],
    "M3N": ["YW"],
    // EAST YORK / CENTRAL (M4)
    "M4A": ["VV"],
    "M4B": ["DR"],
    "M4C": ["DA"],
    "M4E": ["MS", "BB"],
    "M4G": ["LE"],
    "M4H": ["TH"],
    "M4J": ["SWS"],
    "M4K": ["PD", "RV", "TR"],
    "M4L": ["BB", "GA"],
    "M4M": ["JO", "QS"],
    "M4N": ["LO"],
    "M4S": ["MTP"],
    "M4T": ["DE"],
    "M4W": ["TRL", "YO"],
    "M4X": ["SJT"],
    "M4Y": ["SJT"],
    "M4R": ["ND"],
    // DOWNTOWN (M5)
    "M5A": ["PLS", "SL"],
    "M5H": ["CHL"],
    "M5M": ["AH"],
    "M5N": ["FH"],
    "M5R": ["SP", "WY"],
    "M5T": ["LHS", "SD"],
    "M5V": ["FO"],
    // YORK / WEST TORONTO (M6)
    "M6A": ["BF"],
    "M6E": ["MAS", "OV"],
    "M6G": ["CL", "DP", "PA"],
    "M6H": ["BG", "DSC"],
    "M6K": ["PK"],
    "M6L": ["AP"],
    "M6M": ["MD", "EG"],
    "M6N": ["SCS"],
    "M6P": ["AN", "JT"],
    "M6R": ["HP"],
    "M6S": ["RN", "SM"],
    // ETOBICOKE (M8)
    "M8V": ["MC", "NT"],
    "M8W": ["LB", "HB"],
    "M8X": ["BRW"],
    "M8Y": ["HB"],
    "M8W": ["AD"],
    // ETOBICOKE / NORTH YORK (M9)
    "M9B": ["EN", "RI"],
    "M9C": ["EB"],
    "M9L": ["HS"],
    "M9M": ["WV"],
    "M9N": ["WE"],
    "M9P": ["RI"],
    "M9W": ["HW", "NE", "RX"]
};

function getBranchesByPostal(postalCode) {
    if (!postalCode || postalCode.length < 3) return [];
    const prefix = postalCode.slice(0, 3).toUpperCase();
    const branchCodes = postalToBranch[prefix];
    if (!branchCodes) return [];
    return branchCodes.map(code => branchMappings[code]).filter(Boolean);
}

// convert postal to branch codes
function getBranchCodesFromPostal(postalCode) {
    if (!postalCode || postalCode.length < 3) return [];
    const prefix = postalCode.slice(0, 3).toUpperCase();
    return postalToBranch[prefix] || [];
}

const searchBtn = document.getElementById("postal-search");
const postalInput = document.getElementById("postal-input");
const resultDiv = document.getElementById("branch-result");

searchBtn.addEventListener("click", () => {
    const postal = postalInput.value.trim();
    const branchCodes = getBranchCodesFromPostal(postal);

    if (branchCodes.length === 0) {
        resultDiv.textContent = "No branch found for this postal code.";
        highlightBranches([]); // reset
        return;
    }

    const branchNames = branchCodes.map(code => branchMappings[code]).filter(Boolean);

    resultDiv.innerHTML = "Closest Branches: ";

    branchCodes.forEach(code => {
        const link = document.createElement("a");
        link.textContent = branchMappings[code] || code;
        link.href = `branch.html?branch=${code}`;
        link.style.marginRight = "8px";
        link.style.cursor = "pointer";
        link.style.color = "#007bff";
        link.style.textDecoration = "underline";

        resultDiv.appendChild(link);
    });


    // highlight all matching nodes
    highlightBranches(branchCodes);
});
