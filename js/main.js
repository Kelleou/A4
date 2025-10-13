const margin = { top: 40, right: 20, bottom: 40, left: 20 };
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

// Load data
d3.csv("data/library-circulation-by-cardholder-type.csv").then(data => {
  data.forEach(d => {
    d.Circulation = +d.Circulation;
  });

  allData = data.filter(d => d.Year === "2022" || d.Year === "2023");

  const types = Array.from(new Set(allData.map(d => d.CardholderType)));
  types.forEach(t => {
    d3.select("#type-select")
      .append("option")
      .attr("value", t)
      .text(t);
  });

  updateVis("All");

  // Listen for dropdown changes
  d3.select("#type-select").on("change", function() {
    const selected = this.value;
    updateVis(selected);
  });
});

function updateVis(selectedType) {
  const filtered = selectedType === "All" ? allData : allData.filter(d => d.CardholderType === selectedType);

  const sizeScale = d3.scaleSqrt()
    .domain([0, d3.max(filtered, d => d.Circulation)])
    .range([4, 40]);

  const colorScale = d3.scaleOrdinal()
    .domain([...new Set(allData.map(d => d.CardholderType))])
    .range(d3.schemeTableau10);

  svg.selectAll(".node").remove();

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


	// Force simulation with clustering by Year
	simulation = d3.forceSimulation(filtered)
	.force("x", d3.forceX(d => d.Year === "2022" ? width / 4 : (2 * width) / 3).strength(0.3))
	.force("y", d3.forceY(height / 2).strength(0.3))
	.force("charge", d3.forceManyBody().strength(2))
	.force("collision", d3.forceCollide().radius(d => sizeScale(d.Circulation) + 2))
	.on("tick", ticked);

	function ticked() {
	nodes.attr("transform", d => `translate(${d.x},${d.y})`);
	}

  // Legend
  const legend = svg.selectAll(".legend").data(colorScale.domain());
  legend.enter()
    .append("g")
    .attr("class", "legend")
    .merge(legend)
    .attr("transform", (d, i) => `translate(${width - 150}, ${i * 25})`)
    .each(function(d) {
      const g = d3.select(this);
      g.selectAll("*").remove();
      g.append("circle")
        .attr("r", 6)
        .attr("fill", colorScale(d));
      g.append("text")
        .attr("x", 15)
        .attr("y", 4)
        .text(d);
    });
}
