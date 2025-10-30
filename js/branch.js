const urlParams = new URLSearchParams(window.location.search);
const selectedBranch = urlParams.get("branch");
const selectedBranchCode = urlParams.get("branch");
const selectedBranchName =
  branchMappings[selectedBranchCode] || selectedBranchCode;
document.getElementById("title").textContent = `Branch: ${selectedBranchName}`;

Promise.all([
  d3.csv("data/tpl-card-registrations-annual-by-branch.csv", d3.autoType),
  d3.csv("data/tpl-visits-annual-by-branch.csv", d3.autoType),
]).then(([reg, visits]) => {
  reg = reg.filter((d) => d.BranchCode === selectedBranch);
  visits = visits.filter((d) => d.BranchCode === selectedBranch);

  const merged = reg
    .map((r) => ({
      Year: r.Year,
      Registrations: r.Registrations,
      Visits: (visits.find((v) => v.Year === r.Year) || {}).Visits,
    }))
    .filter((d) => d.Visits != null);

  drawScatter({
    data: merged,
    xKey: "Year",
    yKey: "Visits",
    container: "#chart-visits",
    yLabel: "Visits",
  });

  drawScatter({
    data: merged,
    xKey: "Year",
    yKey: "Registrations",
    container: "#chart-registrations",
    yLabel: "Registrations",
  });
});

function drawScatter({ data, xKey, yKey, container, yLabel }) {
  const width = 550,
    height = 320,
    margin = 70;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d[xKey]))
    .nice()
    .range([margin, width - margin]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d[yKey])])
    .nice()
    .range([height - margin, margin]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg
    .append("g")
    .attr("transform", `translate(${margin},0)`)
    .call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .text(xKey);

  svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("transform", `translate(10,${height / 2}) rotate(-90)`)
    .text(yLabel);

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#777")
    .attr("stroke-width", 2)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d[xKey]))
        .y((d) => y(d[yKey]))
    );

  const tip = d3.select("#scatter-tooltip");

  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d[xKey]))
    .attr("cy", (d) => y(d[yKey]))
    .attr("r", 6)
    .attr("fill", "#4da3ff")
    .on("mouseover", (event, d) => {
      tip.style("opacity", 1).html(`
        <strong>Year:</strong> ${d.Year}<br/>
        ${yLabel}: ${d[yKey].toLocaleString()}
      `);
    })
    .on("mousemove", (event) => {
      tip
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => tip.style("opacity", 0));
}
