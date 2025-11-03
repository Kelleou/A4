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
