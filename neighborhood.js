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




function load(geoData, csvData) {
    // if (error) throw error

    var width  = window.innerWidth
    var height = window.innerHeight 

    const individualIncomeData = csvData.map(x => parseFloat(x[individualIncomeAt35]))

    var median = d3.median(individualIncomeData)

    var roundedMedian = roundToNearestThousand(median)


    var values = [ roundedMedian-(thousand*4), roundedMedian-(thousand*3), 
                    roundedMedian-(thousand*2), roundedMedian-thousand, roundedMedian, roundedMedian+thousand, 
                    roundedMedian+(thousand*2), roundedMedian+(thousand*3), roundedMedian+(thousand*4), 
                    roundedMedian+(thousand*5) ]



    var colorScale = d3.scaleThreshold()
                        .domain(values)
                        .range(colors)

    var projection = d3.geoAlbersUsa()
                    .scale(1000)

    var geoPath = d3.geoPath()
                    .projection(projection)


    var svg = d3.select("neighborhood_map")
                .append("svg")
                .attr("width", width)
                .attr("height", height)

    var g = svg.append('g')
                .selectAll("path")
                .data(geoData.features)
                .enter()
                .append("path")
                .attr("fill", function(d, i) {
                    // console.log(d.properties)

                    let zoneId = d.properties['id2']
                    let zoneData = csvData.filter(x => x['cz'] == zoneId)[0]
                    let zoneIndividualIncome = zoneData[individualIncomeAt35] //!!! Boiling point
                    
                    return colorScale(zoneIndividualIncome)

                })
                .attr("stroke", "black")
                .style("stroke-width", "0.1")
                .attr("d", geoPath)
                .on("mouseover", function(d) {

                    // console.log(d)
                    // console.log(d)
                        
                })


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
            console.log(r)
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

(async () => {
    geoData = await d3.json("shown_geography.geojson").then(geoData => geoData) 

    csvData = await d3.csv("CZIndividualIncomeExcludingSpouseAll.csv").then(csvData => csvData) 


    load(geoData, csvData)

})()
