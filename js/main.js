const margin = { top: 40, right: 20, bottom: 60, left: 60 };
const width = 960 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#chart-area")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

let allData, simulation;
let viewMode = "cluster";

// Load data
d3.csv("data/library-circulation-by-cardholder-type.csv").then(data => {
  data.forEach(d => d.Circulation = +d.Circulation);
  allData = data.filter(d => d.BranchCode !== "VIR");

  const types = Array.from(new Set(allData.map(d => d.CardholderType)));
  types.forEach(t => {
    d3.select("#type-select")
      .append("option")
      .attr("value", t)
      .text(t);
  });

  const branches = Array.from(new Set(allData.map(d => d.BranchCode))).sort();
  branches.forEach(b => {
    d3.select("#branch-select")
      .append("option")
      .attr("value", b)
      .text(b);
  });

  // initialize the visualization
  updateVis("All", "All");

  // select card holder type
  d3.select("#type-select").on("change", function () {
    const type = this.value;
    const branch = d3.select("#branch-select").property("value");
    updateVis(type, branch);
  });

  // select branch 
  d3.select("#branch-select").on("change", function () {
    const type = d3.select("#type-select").property("value");
    const branch = this.value;
    highlightBranch(branch);
  });

  // switch between views
  d3.select("#toggle-view").on("click", () => {
    viewMode = viewMode === "cluster" ? "stacked" : "cluster";
    const type = d3.select("#type-select").property("value");
    const branch = d3.select("#branch-select").property("value");
    updateVis(type, branch);
    updateTitle(viewMode, type, branch);
    d3.select("#toggle-view").text(viewMode === "cluster" ? "Switch to Stacked Bars" : "Switch to Cluster");
  });
});

let clusterData = null;
let clusterNodes = null;

function updateVis(selectedType = "All", selectedBranch = "All") {
  let filtered = allData;
  if (selectedType !== "All") {
    filtered = filtered.filter(d => d.CardholderType === selectedType);
  }

  svg.selectAll(".layer").remove();
  svg.selectAll(".legend").remove();
  svg.selectAll(".year-label").remove();
  svg.selectAll(".total-label").remove();
  svg.selectAll(".node").remove();
  svg.selectAll(".x-axis").remove();
  svg.selectAll(".y-axis").remove();
  svg.selectAll(".annotation").remove();

  if (simulation && viewMode !== "cluster") simulation.stop();

  const colorScale = d3.scaleOrdinal()
    .domain([...new Set(allData.map(d => d.CardholderType))])
    .range(["#a6cee3", "#b2df8a", "#fb9a99"]);

  if (viewMode === "cluster") {
    if (simulation) simulation.stop();
    svg.selectAll(".node").remove();
    let clusterBase = [];
    if (selectedType !== "All") {
      clusterBase = filtered.map(d => ({
        BranchCode: d.BranchCode,
        Year: d.Year,
        Circulation: d.Circulation,
        CardholderType: d.CardholderType
      }));
    } else {
      clusterBase = d3.rollups(
        allData,
        v => ({
          total: d3.sum(v, d => d.Circulation),
          types: v.map(d => ({ type: d.CardholderType, value: d.Circulation }))
        }),
        d => d.BranchCode,
        d => d.Year
      ).flatMap(([branch, yearVals]) =>
        yearVals.map(([year, val]) => ({
          BranchCode: branch,
          Year: year,
          total: val.total,
          types: val.types
        }))
      );
    }

    const sizeScale = d3.scaleSqrt()
      .domain([0, d3.max(clusterBase, d => d.total || d.Circulation)])
      .range([4, 20]);

    const fill = d => {
      if (selectedType !== "All") return colorScale(d.CardholderType);
      return "#69b3a2";
    };

    const clusterNodes = svg.selectAll(".node")
      .data(clusterBase)
      .enter()
      .append("g")
      .attr("class", "node")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(150).style("opacity", 1);
        let content = "";
        if (selectedType !== "All") {
          content = `
          <strong>Branch:</strong> ${d.BranchCode}<br/>
          <strong>Year:</strong> ${d.Year}<br/>
          <strong>${d.CardholderType} Circulation:</strong> ${d.Circulation.toLocaleString()}
        `;
        } else {
          const typeBreakdown = d.types.map(t => `${t.type}: ${t.value.toLocaleString()}`).join("<br/>");
          content = `
          <strong>Branch:</strong> ${d.BranchCode}<br/>
          <strong>Year:</strong> ${d.Year}<br/>
          <strong>Total Circulation:</strong> ${d.total.toLocaleString()}<br/>
          ${typeBreakdown}
        `;
        }
        tooltip.html(content)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(300).style("opacity", 0));

    clusterNodes.append("circle")
      .attr("r", d => sizeScale(d.total || d.Circulation))
      .attr("fill", fill)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.2);

    // simulation code to create an animation when forming the cluster
    simulation = d3.forceSimulation(clusterBase)
      .force("x", d3.forceX(d => d.Year === "2022" ? width / 4 : (3 * width) / 4).strength(0.3))
      .force("y", d3.forceY(height / 2).strength(0.3))
      .force("charge", d3.forceManyBody().strength(2))
      .force("collision", d3.forceCollide().radius(d => sizeScale(d.total || d.Circulation) + 2))
      .on("tick", () => clusterNodes.attr("transform", d => `translate(${d.x},${d.y})`));

    svg.selectAll(".year-label")
      .data(["2022", "2023"])
      .enter()
      .append("text")
      .attr("class", "year-label")
      .attr("x", d => d === "2022" ? width / 4 : (3 * width) / 4)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(d => d);
    const totalByYear = {
      "2022": d3.sum(filtered.filter(d => d.Year === '2022'), d => d.Circulation),
      "2023": d3.sum(filtered.filter(d => d.Year === '2023'), d => d.Circulation)
    };
    console.log(filtered);
    console.log(totalByYear);
    const diff = totalByYear["2023"] - totalByYear["2022"];
    let pct = totalByYear["2022"] > 0 ? (diff / totalByYear["2022"]) * 100 : 0;
    pct = Math.round(pct * 100) / 100;

    svg.selectAll(".total-label")
      .data(["2022", "2023"])
      .enter()
      .append("text")
      .attr("class", "total-label")
      .attr("x", d => d === "2022" ? width / 4 : (3 * width) / 4)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "13px")
      .attr("fill", "#555")
      .text(d => d === "2022" ? `Total Circulation: ${d3.format(",")(totalByYear[d])}` : `Total Circulation: ${d3.format(",")(totalByYear[d])} (${pct} %)`);
    drawLegend(colorScale);

    highlightBranch(selectedBranch);
  } else if (viewMode === "stacked") {
    if (simulation) simulation.stop();

    const nested = d3.rollups(
      allData,
      v => ({
        Child: d3.sum(v.filter(d => d.CardholderType === "Child"), d => d.Circulation),
        Teen: d3.sum(v.filter(d => d.CardholderType === "Teen"), d => d.Circulation),
        Adult: d3.sum(v.filter(d => d.CardholderType === "Adult"), d => d.Circulation)
      }),
      d => d.Year,
      d => d.BranchCode
    );

    const branchTotals = d3.rollups(
      allData,
      v => d3.sum(v, d => d.Circulation),
      d => d.BranchCode
    );
    const topBranches = branchTotals
      .sort((a, b) => d3.descending(a[1], b[1]))
      .slice(0, 10)
      .map(d => d[0]);

    const stackData = [];
    nested.forEach(([year, branches]) => {
      branches.forEach(([branch, d]) => {
        if (topBranches.includes(branch)) {
          stackData.push({ Year: year, BranchCode: branch, Child: d.Child, Teen: d.Teen, Adult: d.Adult });
        }
      });
    });

    const stack = d3.stack().keys(["Child", "Teen", "Adult"]);
    const series = stack(stackData);

    const xScale = d3.scaleBand()
      .domain(topBranches)
      .range([50, width - 50])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackData, d => d.Child + d.Teen + d.Adult)])
      .range([height - 50, 50]);

    const stackColor = colorScale;

    svg.selectAll(".layer")
      .data(series)
      .enter()
      .append("g")
      .attr("class", "layer")
      .attr("fill", d => stackColor(d.key))
      .selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.data.BranchCode))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth());

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - 50})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(50,0)`)
      .call(d3.axisLeft(yScale));

    drawLegend(stackColor);
  }
}


function highlightBranch(selectedBranch) {
  svg.selectAll(".node circle")
    .attr("stroke", d => {
      if (selectedBranch === "All") return "#fff";
      return d.BranchCode === selectedBranch ? "#000" : "#fff";
    })
    .attr("stroke-width", d => {
      if (selectedBranch === "All") return 1.2;
      return d.BranchCode === selectedBranch ? 3 : 1.2;
    })
    .attr("opacity", d => {
      if (selectedBranch === "All") return 1;
      return d.BranchCode === selectedBranch ? 1 : 0.25;
    });

  svg.selectAll(".annotation").remove();

  if (selectedBranch === "All") return;
  const branchNodes = svg.selectAll(".node").filter(d => d.BranchCode === selectedBranch);
  const nodesData = branchNodes.data();

  if (nodesData.length === 0) return;
  let circ2022 = 0, circ2023 = 0;
  if (nodesData[0].CardholderType) {
    nodesData.forEach(d => {
      if (d.Year === "2022") circ2022 = d.Circulation;
      if (d.Year === "2023") circ2023 = d.Circulation;
    });
  } else {
    // aggregated view
    nodesData.forEach(d => {
      if (d.Year === "2022") circ2022 = d.total;
      if (d.Year === "2023") circ2023 = d.total;
    });
  }

  const diff = circ2023 - circ2022;
  const pct = circ2022 > 0 ? (diff / circ2022) * 100 : 0;
  if (nodesData.length === 2) {
    const n2022 = nodesData.find(d => d.Year === "2022");
    const n2023 = nodesData.find(d => d.Year === "2023");

    svg.append("text")
      .attr("class", "annotation")
      .attr("x", (n2022.x + n2023.x) / 2)
      .attr("y", (n2022.y + n2023.y) / 2 - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", pct < 0 ? "red" : "green")
      .text(`${pct.toFixed(1)}% ${pct < 0 ? "Ciculation Decrease Compared to 2022" : "Ciculation Increase Compared to 2022"}`);
  }

}


function drawLegend(colorScale) {
  const legend = svg.selectAll(".legend")
    .data([...colorScale.domain(), "All"])
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${width - 50}, ${i * 25})`);

  legend.append("circle")
    .attr("r", 6)
    .attr("fill", d => d == "All" ? "#69b3a2" : colorScale(d));

  legend.append("text")
    .attr("x", 15)
    .attr("y", 4)
    .text(d => d);
}

function updateTitle(viewMode, type = "All", branch = "All") {
  const title = document.querySelector("h3.text-center");
  let baseTitle = viewMode === "cluster"
    ? "Library Circulation by Year"
    : "Top 10 Most Active Branches";
  title.textContent = baseTitle;
}
