const houseHoldIncomeAt35 = "Household_Income_at_Age_35"
const individualIncomeAt35 = "Individual_Income_Excluding_Spouse_at_Age_35"
const thousand = 1000

const colors = [ "#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", 
                    "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695" ]

function getMinMaxVariable(data, variable){
    let column_data = data.map(x => parseFloat(x[variable]))
    return [d3.min(column_data), d3.max(column_data)]
}

function roundToNearestThousand(numberToRound) {
    return Math.round(numberToRound/1000)*1000
}

function parentIncomeChanged() {
    console.log("parentIncome changed")

}
const parentIncomeDiv = d3.select('.parent-income')



const allParentIncome = d3.select('.all')
                            .on('click', () => {
                                   parentIncomeDiv.classed("active", false)  
                                    // console.log(this.node())
                        
                                    // d3.select(this).attr('class', 'active') 
                            })

const highParentIncome = d3.select('.high')
                            .on('click', () => {
                                console.log("high clicked")

                            })

const mediumParentIncome = d3.select('.medium')
                        .on('click', () => {
                            console.log("medium clicked")

                        })

const lowParentIncome = d3.select('.low')
                            .on('click', () => {
                                console.log("low clicked")

                            })

d3.select(".parent-income")
    // .on('click', parentIncomeChanged)



// select all radio buttons and watch for edits
d3.selectAll("input")
    .on("change", update);

function update() {

}


function load(geoData, csvData) {
    // if (error) throw error

    var width  = window.innerWidth
    var height = window.innerHeight 

    var columnName = selectedIncome + selectedRace

    console.log(columnName)
    // console.log(csvData)

    const individualIncomeData = csvData.map(x => parseFloat(x[columnName]))

    var median = d3.median(individualIncomeData)

    var roundedMedian = roundToNearestThousand(median)


    // var values = [ roundedMedian-(thousand*6), roundedMedian-(thousand*4), 
    //                 roundedMedian-(thousand*2), roundedMedian-thousand, roundedMedian, roundedMedian+thousand, 
    //                 roundedMedian+(thousand*2), roundedMedian+(thousand*4), roundedMedian+(thousand*6), 
    //                 roundedMedian+(thousand*7) ]

    var values = [ 22000, 24000, 
        26000, 28000,  30000, 32000, 34000, 36000, 38000, 
        40000 ]

    var colorScale = d3.scaleThreshold()
                        .domain(values)
                        .range(colors)

    var projection = d3.geoAlbersUsa()
                    .scale(1200)
                    .translate([width/3, height/2])

    var geoPath = d3.geoPath()
                    .projection(projection)

    var neighborhoodTip = d3.select('.neighborhoodtip')


    var svg = d3.select("neighborhood_map")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("class", "incomeDataMap")

    
    var Tooltip = d3.select("neighborhood_map")
                    .append("div")
                    .style("opacity", 0)
                    .attr("class", "neighborhood-tip")
                    .style("background-color", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(event, d) {

                        d3.select(this).style("stroke-width", "3.0")

                        Tooltip.style("opacity", 1)
                            
                    }
    var mousemove = function(d) {
                    }
    var mouseleave = function(d) {

                    d3.select(this).style("stroke-width", "0.1")
                    Tooltip.style("opacity", 0)
                    }

    var g = svg.append('g')
                .selectAll("path")
                .data(geoData.features)
                .enter()
                .append("path")
                .attr("fill", function(d, i) {
                    // console.log(d.properties)
                    
                    // console.log(d)
                    let zoneId = d.properties['id2']
                    // console.log(zoneId)
                    let zoneData = csvData.filter(x => x['cz'] == zoneId)[0]
                    // console.log(zoneData)

                    let zoneIndividualIncome = zoneData[columnName] //!!! Boiling point

                    // console.log(zoneIndividualIncome)
                    if (!zoneIndividualIncome) {
                        // console.log(zoneId)
                        return("#d3d3d3")
                    }
                    
                    return colorScale(zoneIndividualIncome)

                })
                .attr("stroke", "black")
                .style("stroke-width", "0.1")
                .attr("d", geoPath)
                .on("mouseover", mouseover)
                .on('mousemove', (e, d) =>  {

                    let zoneId = d.properties['id2']
                    let zoneData = csvData.filter(x => x['cz'] == zoneId)[0]
                    let zoneIndividualIncome = zoneData[columnName]
                    let zoneName = zoneData['Name']
                    let roundedIncome = Math.round(zoneIndividualIncome/1000)
                    // console.log(roundedIncome)
                    // console.log(zoneData)

                    Tooltip.style('top', `${e.pageY}px`)
                            .style('left', `${e.pageX + 10}px`)
                            .html(zoneName + " :  " + roundedIncome + "k")
                })
                .on('mouseout', mouseleave)

    var legend = d3.select('#legend')
                    .append('ul')
                    .attr('class', 'list-inline');

    
    
    var keys = legend.selectAll('li.key')
        .data(colorScale.range());

    keys.enter().append('li')
        .attr('class', 'key')
        .style('border-top-color', String)
        .text(function(d) {
            var r = colorScale.invertExtent(d);
            // console.log(r)
            if (r[0] === undefined) {
                return ( ">$" + r[1]/1000).toString() + "k"
            } 
            else if  (r[1] == undefined) {
                return (">$" + r[0]/1000).toString() + "k"
            }
            else {
                return (r[1]/1000).toString() + "k"
            }

        });

}

var selectedRace = 'All' //This variable will change
var selectedIncome = 'All'
var collatedData = []
var geoData = []


function update() {


    
    if (d3.select(".all-income").property("checked")){
        selectedIncome = 'All'
        console.log("all_race selected")
    }

    else if(d3.select(".high").property("checked")){
        selectedIncome = 'High'
    }

    else if(d3.select(".medium").property("checked")){
        selectedIncome = "Medium"
    }

    else if(d3.select(".low").property("checked")){
        selectedIncome = "Low"

    }

    // traits filter
    if (d3.select(".all-race").property("checked")){
        selectedRace = 'All'
        console.log("all_race selected")
    }

    else if(d3.select(".white").property("checked")){
        selectedRace = 'White'
    }

    else if(d3.select(".hispanic").property("checked")){
        selectedRace = "Hispanic"
    }

    else if(d3.select(".black").property("checked")){
        selectedRace = "Black"
    }

    else if(d3.select(".asian").property("checked")){
        selectedRace = "Asian"
    }

    else if(d3.select(".american-indian").property("checked")){
        selectedRace = "AmericanIndian"
    }
    console.log()

    d3.selectAll(".incomeDataMap").remove();	
    d3.selectAll(".list-inline").remove();
    d3.selectAll(".neighborhood-tip").remove();
    
    load(geoData, collatedData)
}

d3.selectAll("input")
    .on("change", update);






(async () => {
    geoData = await d3.json("shown_geography.geojson").then(geoData => geoData) 

    csvData = await d3.csv("CZIndividualIncomeExcludingSpouseAll.csv").then(csvData => csvData) 

    

    collatedData = await d3.csv("CollatedData.csv").then(collatedData => collatedData)

    

    // need a csv filtering data here


    load(geoData, collatedData)

})()
