/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 100, right: 200 };

/* APPLICATION STATE */
let state = {
  data: [],
  selectedVariable: 'gender', // Default selected variable
  selectedType: 'all', // Default selected type
};

// since we use our scales in multiple functions, they need global scope
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
  // save our data to application state
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
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
    .tickFormat((d, i) => i % 2 === 0 ? `${d}` : "") // Displays every alternate label
    .ticks(Math.ceil(decades.length))
    .tickPadding(10)
    // Remove outer ticks

  
  xAxis = d3.axisBottom(xScale)
  .tickFormat(d => `${d}s`)
  .tickSize(0)
  .tickPadding(10);// Remove outer ticks
  


  // Create color scales for each selection category
const colorScales = {
  'gender': d3.scaleOrdinal(d3.schemeCategory10.map(color => d3.color(color).darker(0.5))),
  'art department': d3.scaleOrdinal(d3.schemeCategory10.map(color => d3.color(color).darker(0.5))), // You can customize this scale if needed
};

colorScale = colorScales[state.selectedVariable];

  // Append variable dropdown menu
  variableDropdown = d3.select("#container")
    .append("select")
    .attr("id", "variable-dropdown")
    .on("change", function () {
      state.selectedVariable = this.value;
      draw(); // Redraw on dropdown change
    });

  // Add variable options to the dropdown
  variableDropdown.selectAll("option")
    .data(['gender', 'art department'])
    .enter().append("option")
    .attr("value", d => d)
    .style("font-family", "inherit")
    .text(d => d);

  // Append type dropdown menu
  typeDropdown = d3.select("#container")
    .append("select")
    .attr("id", "type-dropdown")
   
    .on("change", function () {
      state.selectedType = this.value;
      draw(); // Redraw on dropdown change
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
      .style("left", event.pageX + 15 + "px")  // Use pageX instead of x
      .style("top", event.pageY - 30 + "px")  // Use pageY instead of y
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





  draw(); // calls the draw function
}

/* DRAW FUNCTION */
function draw() {
  /* HTML ELEMENTS */
  svg.selectAll("rect.bar").remove(); // Remove existing bars before updating

  // Filter data based on selected variable and type
let filteredData;


if (state.selectedVariable === 'gender') {
  filteredData = state.data.filter(d => {
    if (state.selectedType === 'all') {
      return true; // Show all gender types
    } else {
      return d.Gender === state.selectedType;
    }
  });
} else if (state.selectedVariable === 'art department') {
  filteredData = state.data.filter(d => {
    if (state.selectedType === 'all') {
      return true; // Show all art department types
    } else {
      return d.Department === state.selectedType;
    }
  });
}

// if (!filteredData || filteredData.length === 0) {
//   return; // No data to display
// }

  //Data based on decade and purchase count
  const countsByDecade = d3.rollup(filteredData, v => d3.sum(v, d => 1), d => Math.floor(d.DateAcquired / 10) * 10);
  // colorScale = colorScales[state.selectedVariable];

// Create bars with transition
svg.selectAll("rect.bar")
  .data(Array.from(countsByDecade))
  .join(
    enter => enter.append("rect")
      .attr("class", "bar")
      // .attr("x", d => xScale(String(d[0])))
      .attr("x", d => xScale(d[0])+50)

      .attr("y", height - margin.bottom -10) // Set initial y position at the bottom
      .attr("width", xScale.bandwidth())
      .attr("height", 0) // Set initial height to 0
      .attr("stroke", "black") // Border color
      .attr("stroke-width", 2)
      .attr("fill", (d, i) => colorScale(state.selectedType))//was i
      .call(sel => sel
        .transition()
        .duration(1000)
        .attr("y", d => yScale(d[1])) // Transition to the correct y position
        .attr("height", d => height - margin.bottom - yScale(d[1])-10) // Transition to the correct height
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
        .attr("y", height - margin.bottom) // Transition to the bottom for a fade-out effect
        .attr("height", 0) // Transition to height 0 for a fade-out effect
        .remove()
      )  
    )
    .on("mouseover", mouseHover)
    .on("mouseout", mouseLeave);







}
