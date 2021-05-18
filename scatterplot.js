const file = 'https://raw.githubusercontent.com/6859-sp21/final-project-social_mobility/main/data/joint_table1_2.csv'

let searchButton = d3.select('#search');
let clearButton = d3.select('#clear');
let showButton = d3.select('#show');
let isDrawing = false;
let showClicked = false;



d3.csv("https://raw.githubusercontent.com/6859-sp21/final-project-social_mobility/main/data/joint_table1_2.csv").then(function(rawScatter) {
    
    // Create an array of college names
    allColleges = [];
    allPar = [];
    allK =[];
    allAccess = [];
    allSuccess = [];
    searchCollege = "";
    clickedCollege = "";

    // Correct variable type and populate the allColleges list
    rawScatter.forEach(function(d) {
            d.k_median = +d.k_median;
            d.par_median = +d.par_median;
            d.tier = +d.tier;
            d.access_rate = Math.round((+d.access_rate));
            d.success_rate = Math.round((+d.success_rate));
            allColleges.push(d.name);
            allAccess.push(d.access_rate);
            allPar.push(d.par_median);
            allK.push(d.k_median);
        });

    
    const avgPar = Math.round((allPar.reduce((a,b) => a + b, 0) / allPar.length));
    const avgK = Math.round((allK.reduce((a,b) => a + b, 0) / allK.length));
    // const avgAccess = (allAccess.reduce((a,b) => a + b, 0) / allAccess.length).toFixed(2);
    const avgAccess = Math.round(allAccess.reduce((a,b) => a + b, 0));
    const avgSuccess = Math.round(allSuccess.reduce((a,b) => a + b, 0));


    console.log(avgAccess);

    // Autocomplete the college search input filed using jquery
    $( "#collegeSearch" ).autocomplete({
        source: allColleges
      });

    searchButton.on('click', () => {
        if (findCollege()) {
            showClicked = false;
            searchButton.style('display', 'none');
            showButton.style('display', '');
            updateChart();
        }
    })

    // New search submitted through enter key
    $("#collegeSearch").keyup(function (e) {
        if (e.keyCode == 13) {
            if (findCollege()) {
                showClicked = false;
                searchButton.style('display', 'none');
                showButton.style('display', '');
                updateChart();
            }
        }
    });

    showButton.on('click', () => {
        isDrawing = false;
        showClicked = true;
        showButton.style('display', 'none');
        searchButton.style('display', '');
        clearButton.style('display', '');
        tierLabel.text(searchCollege);
        updateChart();
    })

    clearButton.on('click', () => {
        showClicked = false;
        clickedCollege = "";
        drawing.remove();
        drawing = svg.append("circle");
        showButton.style('display', 'none');
        clearButton.style('display', 'none');
        tierLabel.text("");
        g.selectAll('path').remove();
        chartsDataJoin();
    })
    
    function findCollege(){
        searchCollege = document.getElementById('collegeSearch').value;
        if (allColleges.indexOf(searchCollege) > -1) {
            isDrawing = true;
            return true;
        }
        return false;
    }


    // Function for updating the trait filter and generate graph
    function updateChart() {
        // Make a copy of the raw data so that manipulation does not impact raw
        selectedScatter = [...rawScatter];
        selectedScatter = selectedScatter.filter(d => d.name == searchCollege)
        chartsDataJoin(selectedScatter);
    }

    function updateTier(tier){
        selectedScatter = [...rawScatter];
        selectedScatter = selectedScatter.filter(d => d.tier == tier);
        chartsDataJoin(selectedScatter);
    }

    // Debug
    console.log(rawScatter);

    // -----------------------------scatter chart--------------------------------------------
    
    // Setting up variables that describe our chart's space.
    const height = 600;
    const width = 800;
    const margin = ({top: 10, right: 20, bottom: 20, left: 50});

    // Create a SVG we will use to make our chart.
    const svg = d3.create('svg')
    .attr('width', width)
    .attr('height', height);

    // Setting up scales.
    const xScale = d3.scaleLinear()
    .domain([0, d3.max(rawScatter, d => d.par_median)])
    .range([margin.left, width - margin.right])
    .nice();

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(rawScatter, d => d.k_median)])
    .range([height - margin.bottom, margin.top])
    .nice();

    const colorScale = d3.scaleOrdinal()
    .domain(rawScatter.map(d => d.tier))
    .range(d3.schemeBlues[9]);

    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip_scatter")
    .style("opacity", 0);

    // 5. Drawing our points
    const symbol = d3.symbol();
    const g = svg.append('g')
    .classed('marks', true)

    //8.  Adding a college tier label.
    const tierLabel = svg.append('text')
    .attr('x', 100)
    .attr('y', margin.top + 10)
    .attr('fill', 'gray')
    .attr('font-size', 18)
    .text("");
    
    // Drawing scatter x-axis
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

    //7. Drawing scatter y-axis
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


    // -----------------------------people chart--------------------------------------------
    const numPerRow = 10;
    const size = 40;
    const access = 10;
    const success = 3;
    const scale = d3.scaleLinear() // <-A
    .domain([0, numPerRow -1])
    .range([0, size * numPerRow])

    const svg_people = d3.create('svg')
        .attr('width', width)
        .attr('height', height);
    
    svg_people.selectAll('rect')
        .data(d3.range(100)) // <-B
        .enter().append('rect')
        .attr('x', (d, i) => {
            const n = i % numPerRow  // <-C
            return scale(n)
        })
        .attr('y', (d, i) => {
            const n = Math.floor(i / 10) // <-D
            return scale(n)
        }) 
        .attr('width', size)
        .attr('height', size)
        .attr('fill', 'gray')
        .attr('stroke-width', 2)
        .attr('stroke', 'white');
    
    // // Access rate: students from poor family
    // svg_people.selectAll('rect')
    //     .data(d3.range(access)) // <-B
    //     .attr('fill', 'black')

    // // Success rate: students from poor family who become rich
    // svg_people.selectAll('rect')
    //     .data(d3.range(success)) // <-B
    //     .attr('fill', 'blue')

    d3.select('#peopleText').html("testing text");


    // ----------------Data join functions----------------------------------------
    
    // Draw mode
    let drawing = svg.append("circle")
    svg.on("click", function(event){
        if (isDrawing){
            var mouse = d3.pointer(event);
            drawing
            .attr("cx", mouse[0])
            .attr("cy", mouse[1])
            .attr("fill", "red")
            .attr('r', 6)
        }
        
    });

    //scatter plot datajoin
    function dataJoinScatter(rawData = rawScatter) {
        g.selectAll('path')
        .data(rawData)
        .join(
            enter  => enter.append('path')
                // .transition()
                // .duration(200)  
                .attr('fill', d => colorScale(d.tier))
                .attr("d", symbol.size(32))
                .style("opacity", .8),
            update => update
                .attr('fill', d => colorScale(d.tier))
                .attr("d", symbol.size((d) => {
                    if (showClicked || d.name == clickedCollege){
                        return 120;
                    }
                    else{
                        return 32;
                    }
                })) 
                .style("opacity", () => {
                    if (isDrawing){
                        return 0;
                    }
                    else{
                        return .8
                    }
                })
                .style("stroke", "#b3e0ff")
                .style("stroke-width", (d) => {
                    if (showClicked || d.name == clickedCollege){
                        return "2px";
                    }
                    return "0px";
                }),
            exit => exit.transition()
            .duration(200)
            .attr("d", symbol.size(32))
            .attr("fill", "gray")
            .style("opacity", 0.1)
        )
        .attr('transform', d => `translate(${xScale(d.par_median)}, ${yScale(d.k_median)})`)
        .on("mouseover", function(event, d) {
            if (!isDrawing && !showClicked){
                tooltip.transition()
                .duration(200)
                .style("opacity", .9);
                tooltip.html("<b>" + d.name + "</b>" + "<br/> Tier: " + d.tier_name)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");

                d3.select(this)
                    .attr("d", symbol.size(140));
            }
        })
        .on("mouseout", function(event, d) {
            if (!isDrawing && !showClicked){
                tooltip.transition()
                .duration(500)
                .style("opacity", 0);

                d3.select(this)
                    .attr("d", symbol.size((d) => {
                        if (showClicked || d.name == clickedCollege){
                            return 120;
                        }
                        else{
                            return 32;
                        }
                    }))
            }
        })
        .on("click", function(event, d){
            if (!isDrawing && !showClicked){
                clickedCollege = d.name;
                clearButton.style("display", "");
                tierLabel.text("College Tier: " + d.tier_name);
                updateTier(d.tier);
            }
        })

        if(isDrawing){
            d3.select('#scatterText').html("The median family income of a student from " + rawData[0].name + 
            " is " + "<b>" + "?" + "</b>" + ". The median income of a student at age 34 is " + "<b>" + "?" + "</b>" + 
            ".<br/> Average class size: " + "?");
        }
    
        else if (showClicked){
            d3.select('#scatterText').html("The median family income of a student from " + rawData[0].name + 
            " is " + "<b>" + rawData[0].par_median + "</b>" + ". The median income of a student at age 34 is " + "<b>" + rawData[0].k_median + "</b>" + 
            ".<br/> Average class size: " + Math.round(rawData[0].count));
        }

        else{
            d3.select('#scatterText').html("The average median family income of students from all colleges is " + avgPar + ". The average median income of students at age 34 is " + avgK + ".");
        }
    }

    // People chart data join
    function dataJoinPpl(accessInput, successInput) {
        // Access rate: students from poor family
        svg_people.selectAll('rect')
        .data(d3.range(access)) // <-B
        .attr('fill', 'black')

        // Success rate: students from poor family who become rich
        svg_people.selectAll('rect')
            .data(d3.range(success)) // <-B
            .attr('fill', 'blue')
      }

    // Helper to draw both the scatter plot and the people chart
    function chartsDataJoin(rawData = rawScatter, accessInput = avgAccess, successInput = avgSuccess) {
        dataJoinScatter(rawData);
        dataJoinPpl(accessInput, successInput);
    };

    chartsDataJoin();

    document.getElementById("scatterChart").appendChild(svg.node());
    document.getElementById("peopleChart").appendChild(svg_people.node());
});
