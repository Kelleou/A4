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

  // Type dropdown
  const types = Array.from(new Set(allData.map(d => d.CardholderType)));
  types.forEach(t => {
    d3.select("#type-select")
      .append("option")
      .attr("value", t)
      .text(t);
  });

  updateVis("All");

  // Dropdown change
  d3.select("#type-select").on("change", function () {
    updateVis(this.value);
  });

  // Toggle button
  d3.select("#toggle-view").on("click", () => {
    viewMode = viewMode === "cluster" ? "stacked" : "cluster";
    updateVis(d3.select("#type-select").property("value"));
    d3.select("#toggle-view").text(viewMode === "cluster" ? "Switch to Stacked Bars" : "Switch to Cluster");
  });
});

function updateVis(selectedType) {
  const filtered = selectedType === "All" ? allData : allData.filter(d => d.CardholderType === selectedType);

  svg.selectAll(".node").remove();
  svg.selectAll(".layer").remove();
  svg.selectAll(".legend").remove();
  if (simulation) simulation.stop();

  const sizeScale = d3.scaleSqrt()
    .domain([0, d3.max(filtered, d => d.Circulation)])
    .range([4, 20]);

  const colorScale = d3.scaleOrdinal()
    .domain([...new Set(allData.map(d => d.CardholderType))])
    .range([
      "#a6cee3",
      "#b2df8a",
      "#fb9a99",
    ]);

  if (viewMode === "cluster") {
    svg.selectAll(".node").remove();
    svg.selectAll(".year-label").remove();

    const nodes = svg.selectAll(".node")
      .data(filtered, d => d._id)
      .enter()
      .append("g")
      .attr("class", "node")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(`
        <strong>Branch:</strong> ${d.BranchCode}<br/>
        <strong>Year:</strong> ${d.Year}<br/>
        <strong>Cardholder:</strong> ${d.CardholderType}<br/>
        <strong>Circulation:</strong> ${d.Circulation.toLocaleString()}
      `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(300).style("opacity", 0));

    nodes.append("circle")
      .attr("r", d => sizeScale(d.Circulation))
      .attr("fill", d => colorScale(d.CardholderType))
      .attr("stroke", d => d.Year === "2023" ? "#000" : "#fff")
      .attr("stroke-width", 1.2);

    // Force simulation
    if (simulation) simulation.stop();
    simulation = d3.forceSimulation(filtered)
      .force("x", d3.forceX(d => d.Year === "2022" ? width / 4 : (3 * width) / 4).strength(0.3))
      .force("y", d3.forceY(height / 2).strength(0.3))
      .force("charge", d3.forceManyBody().strength(2))
      .force("collision", d3.forceCollide().radius(d => sizeScale(d.Circulation) + 2))
      .on("tick", () => {
        nodes.attr("transform", d => `translate(${d.x},${d.y})`);
      });

    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();

    const years = ["2022", "2023"];
    svg.selectAll(".year-label")
      .data(years)
      .enter()
      .append("text")
      .attr("class", "year-label")
      .attr("x", d => d === "2022" ? width / 4 : (3 * width) / 4)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(d => d);

    svg.selectAll(".legend").raise();
    drawLegend(colorScale);
  } else if (viewMode === "stacked") {

    // Aggregate per Branch & Year
    const nested = d3.rollups(
      allData,
      v => {
        return {
          Child: d3.sum(v.filter(d => d.CardholderType === "Child"), d => d.Circulation),
          Teen: d3.sum(v.filter(d => d.CardholderType === "Teen"), d => d.Circulation),
          Adult: d3.sum(v.filter(d => d.CardholderType === "Adult"), d => d.Circulation),
        };
      },
      d => d.Year,
      d => d.BranchCode
    );

    // Only include top 10 branch
    const branchTotals = d3.rollups(
      allData,
      v => d3.sum(v, d => d.Circulation),
      d => d.BranchCode
    );
    const topBranches = branchTotals.sort((a, b) => d3.descending(a[1], b[1])).slice(0, 10).map(d => d[0]);

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

    const yScale = d3.scaleSqrt()
      .domain([0, d3.max(stackData, d => d.Child + d.Teen + d.Adult)])
      .range([height - 50, 50]);

    const stackColor = d3.scaleOrdinal()
      .domain([...new Set(allData.map(d => d.CardholderType))])
      .range([
        "#a6cee3",
        "#b2df8a",
        "#fb9a99",
      ]);

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
      .attr("width", xScale.bandwidth())
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(150).style("opacity", 1);
        tooltip.html(`
          <strong>Branch:</strong> ${d.data.BranchCode}<br/>
          <strong>Child:</strong> ${d.data.Child}<br/>
          <strong>Teen:</strong> ${d.data.Teen}<br/>
          <strong>Adult:</strong> ${d.data.Adult}<br/>
          <strong>Total:</strong> ${d.data.Child + d.data.Teen + d.data.Adult}
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(300).style("opacity", 0));

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

function drawLegend(colorScale) {
  const legend = svg.selectAll(".legend")
    .data(colorScale.domain())
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${width - 150}, ${i * 25})`);

  legend.append("circle")
    .attr("r", 6)
    .attr("fill", d => colorScale(d));

  legend.append("text")
    .attr("x", 15)
    .attr("y", 4)
    .text(d => d);
}
