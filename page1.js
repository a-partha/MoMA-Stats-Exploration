
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 100, right: 200 };


/* APPLICATION STATE */
let state = {
  data: [],
  selectedVariable: 'gender', // Default 
  selectedType: 'all', // Default
};

let svg;
let xScale;
let yScale;
let colorScale;
let xAxis;
let yAxis;
let variableDropdown;
let typeDropdown;
let tooltip;
let mouseHover;
let mouseLeave;

/* LOAD DATA */
d3.csv('Artworks_clean.csv', d3.autoType).then(raw_data => {
  console.log("data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
function init() {
  /* SCALES */
  const decades = Array.from(new Set(state.data.map(d => Math.floor(d.DateAcquired / 10) * 10)));
  
  xScale = d3.scaleBand()
    .domain(decades.map(String))
    .range([margin.left, width - margin.right])
    .padding(0.35);

  yScale = d3.scaleLog() // Use logarithmic scale for y-axis
    .domain([1, d3.max(state.data, d => Math.floor(d.DateAcquired / 10) * 10 + 10)])
    .range([height - margin.bottom, margin.top]);

  
  yAxis = d3.axisLeft(yScale)
    .tickFormat((d, i) => i % 2 === 0 ? `${d}` : "") // Shows every alternate label only
    .ticks(Math.ceil(decades.length))
    .tickPadding(10)
  
  xAxis = d3.axisBottom(xScale)
  .tickFormat(d => `${d}s`)
  .tickSize(0)
  .tickPadding(10);


// Color scales for each selection category
const colorScales = {
  'gender': d3.scaleOrdinal(d3.schemeCategory10.map(color => d3.color(color).darker(0.5))),
  'art department': d3.scaleOrdinal(d3.schemeCategory10.map(color => d3.color(color).darker(0.5))), 
};

colorScale = colorScales[state.selectedVariable];

  // Append variable dropdown menu
  variableDropdown = d3.select("#container")
    .append("select")
    .attr("id", "variable-dropdown")
    .on("change", function () {
      state.selectedVariable = this.value;
      draw(); // 
    });

  // Add gender options to the dropdown
  variableDropdown.selectAll("option")
    .data(['gender', 'art department'])
    .enter().append("option")
    .attr("value", d => d)
    .style("font-family", "inherit")
    .text(d => d);

  // Append department type dropdown menu
  typeDropdown = d3.select("#container")
    .append("select")
    .attr("id", "type-dropdown")
   
    .on("change", function () {
      state.selectedType = this.value;
      draw(); 
    });

  // Add type options to the dropdown
  typeDropdown.selectAll("option")
    .data(['all', 'male', 'female', 'non-binary', 'Drawings & Prints', 'Photography', 'Architecture & Design', 'Painting & Sculpture', 'Media and Performance', 'Fluxus Collection'])
    .enter().append("option")
    .attr("value", d => d)
    .style("font-family", "inherit")
    .text(d => d);

  svg = d3.select("#container")
    .append("svg")
    .attr("width", width - 200)
    .attr("height", height - margin.bottom)
    .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
    .attr("transform", `translate(50, ${height - margin.bottom -10})`)
    .call(xAxis)
    .selectAll(".tick text")
    .attr("font-size", "1.5em");

  svg.append("g")
    .attr("transform", `translate(150, -10)`)
    .call(yAxis)
    .selectAll(".tick text")
    .attr("font-size", "1.5em")
 

    svg.selectAll(".domain")
    .attr("stroke-width", 2);


  svg.append("text")
   .attr("x", width / 2)
   .attr("y", height-30)
   .attr("dy", margin.bottom / 2)
   .attr("text-anchor", "middle")
   .style("font-size", "25px")
   .text("Decades");

svg.append("text")
.attr("transform", "rotate(-90)")
.attr("x", -height / 2)
.attr("y", margin.left - 70)//
.attr("dy", margin.left / 2)
.attr("text-anchor", "middle")
.style("font-size", "25px")
.text("Count");

  tooltip = d3.select("#container")
   .append("div")
   .attr("class", "tooltip")


  mouseHover = function (event, d) {
    tooltip
      .style("opacity", 1)
      .html('Count:'+ d[1])
      .style("left", event.pageX + 15 + "px")  
      .style("top", event.pageY - 30 + "px")  
      .transition()
      .delay(50);
  }

  
 mouseLeave = function () {
 tooltip
  .transition()
  .delay(20)
  .duration(200)
  .style("opacity", 0);
 };

  draw(); 
}


/* DRAW FUNCTION */
function draw() {

  /* HTML ELEMENTS */
  svg.selectAll("rect.bar").remove(); 
  
// Filter data based on selected gender and department type
let filteredData;


if (state.selectedVariable === 'gender') {
  filteredData = state.data.filter(d => {
    if (state.selectedType === 'all') {
      return true; 
    } else {
      return d.Gender === state.selectedType;
    }
  });
} else if (state.selectedVariable === 'art department') {
  filteredData = state.data.filter(d => {
    if (state.selectedType === 'all') {
      return true;
    } else {
      return d.Department === state.selectedType;
    }
  });
}

  //Data based on decade and acquisition count
  const countsByDecade = d3.rollup(filteredData, v => d3.sum(v, d => 1), d => Math.floor(d.DateAcquired / 10) * 10);

// Create bars with transition
svg.selectAll("rect.bar")
  .data(Array.from(countsByDecade))
  .join(
    enter => enter.append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d[0])+50)
      .attr("y", height - margin.bottom -10) // Set initial y position at the bottom
      .attr("width", xScale.bandwidth())
      .attr("height", 0) // Set initial height to 0
      .attr("stroke", "black") 
      .attr("stroke-width", 2)
      .attr("fill", (d, i) => colorScale(state.selectedType))//was i
      .call(sel => sel
        .transition()
        .duration(1000)
        .attr("y", d => yScale(d[1])) 
        .attr("height", d => height - margin.bottom - yScale(d[1])-10) 
        .delay((d, i) => i * 50)
      ),
    update => update
      .call(sel => sel
        .transition()
        .duration(1000)
        .attr("x", d => xScale(String(d[0])))
        .attr("y", d => yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - margin.bottom - yScale(d[1]))
        .attr("fill", (d, i) => colorScale(state.selectedType))
        .delay((d, i) => i * 50)
      ),
    exit => exit
      .call(sel => sel
        .transition()
        .duration(1000)
        .attr("y", height - margin.bottom) 
        .attr("height", 0)
        .remove()
      )  
    )
    .on("mouseover", mouseHover)
    .on("mouseout", mouseLeave);


const table1960 = [
    { statistic: 't value', value: 7.11 },
    { statistic: 'P(T<=t) one-tail', value: 0.00 },
    { statistic: 'P(T<=t) two-tail', value: 0.00 },
  ];

  
const tableBody1 = d3.select("#stats1960-table tbody");
  // Update the table body
  tableBody1.selectAll("tr")
    .data(table1960)
    .enter()
    .append("tr")
    .attr("class", "stats_1960")
    .html(d => `<td>${d.statistic}</td><td>${d.value}</td>`);


const table2000 = [
  { statistic: 't value', value: 2.29 },
  { statistic: 'P(T<=t) one-tail', value: 0.02 },
  { statistic: 'P(T<=t) two-tail', value: 0.04 },
];

const tableBody2 = d3.select("#stats2000-table tbody");
tableBody2.selectAll("tr")
  .data(table2000)
  .enter()
  .append("tr")
  .attr("class", "stats_2000")
  .html(d => `<td>${d.statistic}</td><td>${d.value}</td>`);

}
