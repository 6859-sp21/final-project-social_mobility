let redraw = d3.select('#redraw');

d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-social_mobility/main/data/joint_table1_2.csv").then(function(college) {
    
    college.forEach(function(d) {
            d.k_median = +d.k_median;
            d.par_median = +d.par_median;
            d.tier = +d.tier;
        });

    // Debug
    console.log(college);

    // 2. Setting up variables that describe our chart's space.
    const height = 600;
    const width = 800;;
    const margin = ({top: 10, right: 20, bottom: 20, left: 40});

    // 3. Create a SVG we will use to make our chart.
    // See https://developer.mozilla.org/en-US/docs/Web/SVG for more on SVGs.
    const svg = d3.create('svg')
    .attr('width', width)
    .attr('height', height);

    // 4. Setting up scales.
    const xScale = d3.scaleLinear()
    .domain([0, d3.max(college, d => d.par_median)])
    .range([margin.left, width - margin.right])
    .nice();

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(college, d => d.k_median)])
    .range([height - margin.bottom, margin.top])
    .nice();

    const colorScale = d3.scaleOrdinal()
    .domain(college.map(d => d.tier))
    .range(d3.schemeBlues[9]);

    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip_scatter")
    .style("opacity", 0);

    // 5. Drawing our points
    // See symbol docs https://github.com/d3/d3-shape/blob/v2.1.0/README.md#symbol
    const symbol = d3.symbol();
    svg.append('g')
    .selectAll('path') // d3-shape functions (like d3.symbol) generate attributes for SVG <path> elements
    .data(college)
    .join('path')
    .attr('transform', d => `translate(${xScale(d.par_median)}, ${yScale(d.k_median)})`)
    .attr('fill', d => colorScale(d.tier))
    .attr('d', d => symbol()) // Notice, the output of the d3.symbol is wired up to the "d" attribute.
    .on("mouseover", function(event, d) {
        tooltip.transition()
        .duration(200)
        .style("opacity", .9);
        tooltip.html("<b>" + d.name + "</b>" + "<br/> Tier: " + d.tier_name + "<br/> Median Family Income: " + d.par_median + "<br/> Median Individual Income: " + d.k_median)
        .style("left", (event.pageX) + "px")
        .style("background", colorScale(d.tier))
        .style("top", (event.pageY - 28) + "px");

        d3.select(this)
            .attr("fill", "black")
            .attr("d", symbol.size(64 * 4));
        })
    .on("mouseout", function(event, d) {
        tooltip.transition()
        .duration(500)
        .style("opacity", 0);

        d3.select(this)
            .attr("fill", colorScale(d.tier))
            .attr("d", symbol.size(64))
        });

    // Click to draw
    let drawing = svg.append("circle")
    svg.on("click", function(event){
        var mouse = d3.pointer(event);
        console.log(mouse);
            drawing
            .attr("cx", mouse[0])
            .attr("cy", mouse[1])
            .attr("fill", "red")
            .attr('r', 6)
    });

    // Clear drawing
    redraw.on('click', () => {
        drawing.remove();
        drawing = svg.append("circle");
    })

    //6. Drawing our x-axis
    svg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    // Add x-axis title 'text' element.
    .append('text')
    .attr('text-anchor', 'end')
    .attr('fill', 'black')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('x', width - margin.right)
    .attr('y', -10)
    .text('Median Family Income');

    //7. Drawing our y-axis
    svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale))
    // Add y-axis title 'text' element.
    .append('text')
        .attr('transform', `translate(20, ${margin.top}) rotate(-90)`)
        .attr('text-anchor', 'end')
        .attr('fill', 'black')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Median Individual Income');

    document.getElementById("chart").appendChild(svg.node());
});