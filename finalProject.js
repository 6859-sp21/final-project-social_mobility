const body = d3.select("body").node()
// var map = d3.select("map").node()
var width  = window.innerWidth
var height = window.innerHeight

// console.log(height)
// console.log(width)

// var width = 900
// var height = 600

const usStatesFile = "us-states.json" //look for where to get scalable US maps?*
const mobilityDataFile = "mrc_table3.csv"
const mobilityRate = "mr_kq5_pq1" 

// const 

const getMinMaxStateAverage = (mobilityData) => {
    let avgs = []

    for(const stateName in  stateNameToAbbr) {
        const abbr = stateNameToAbbr[stateName]
        // console.log(abbr)
        let stateData = mobilityData.filter(x => x.state === abbr)
        let stateMobilityData = stateData.map(x => { return parseFloat(x[mobilityRate])})
        avgs.push(d3.mean(stateMobilityData))
    }
    return [d3.min(avgs), d3.max(avgs)]
}

const getStateAvg = (mobilityData, stateName) => {
    const abbr = stateNameToAbbr[stateName]
    let stateData = mobilityData.filter(x => x.state === abbr)
    let stateMobilityData = stateData.map(x => { return parseFloat(x[mobilityRate])})

    return d3.mean(stateMobilityData)
}

const isMobilityRateNotNan = (x) => {
    return x[mobilityRate] !== ""
}

// const getStateFeatures = (stateData, stateName) => {
    
//     console.log(stateData.features.filter(x => x.properties.name == stateName))
    
//     return stateData.features.filter(x => x.properties.name == stateName)
// }

const lowColor = "#D4EEFF";
const highColor = "#0099FF"

const getCollegeMobilityRates = (mobilityData, abbr) => {
        let filtered = mobilityData.filter( x => x.state === abbr)

        let nullRemoved = filtered.filter(isMobilityRateNotNan)
        

        let sorted = nullRemoved.sort((x,y) =>  {return parseFloat(y.mr_kq5_pq1)- parseFloat(x.mr_kq5_pq1)}).slice(0,10)

        let result = []

        for (const object of sorted) { 
            let temp =  {
                College : object.name, 
                // Mobility: object[mobilityRate]
                Mobility : (Math.round(object[mobilityRate] * 10000)/100).toFixed(2) + "%"
            }
            result.push(temp)
        }

        return  result
}

const generateMap = (stateData, mobilityData) => {

    // console.log(getMinMaxStateAverage(mobilityData))

    var colorScale = d3.scaleLinear()
                        .range([lowColor, highColor])
                        .interpolate(d3.interpolateLab)
                        .domain(getMinMaxStateAverage(mobilityData))

    // console.log(d3.extent(mobilityData, (d) => { return parseFloat(d[mobilityRate])}))

    const getColor = (d) => {
        // console.log(d)

        let stateName = d.properties.name
        let stateAbbr = stateNameToAbbr[stateName]

        let stateData = mobilityData.filter( row  => row.state == stateAbbr)

        // console.log(stateData[0][mobilityRate])
        let stateMobilityData = stateData.map((x) => {return parseFloat(x[mobilityRate])})
        // console.log(stateMobilityData)

        let stateAverage = d3.mean(stateMobilityData)

        return colorScale(stateAverage)

    }

    // console.log(stateData)
    var projection = d3.geoAlbersUsa()
                        // .translate([width/3, height/5])
                        .scale([1000])
    
    var path = d3.geoPath()
                    .projection(projection)
    
    
    var svg = d3.select("map")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
    
    var tooltip = d3.select("tooltip")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("visibility", "hidden")
    
    const stateNameHtml = d3.select("stateTitle")

    const stats = d3.select("stats")
    
    var collegeTable = d3.select("collegeTable")

    // console.log(stateData.features)
    //bind data to SVG and create one path per GeoJSON feature 

    var state = svg.selectAll("path")
       .data(stateData.features)
       .enter()
       .append("path")
       .attr("d", path)
       .style("stroke", "#fff")
       .style("stroke-width", "0.5")
       .attr("fill", function(d, i) {
            
            // console.log(stateAbbr)

            // console.log(d)

            return getColor(d)
       })
    //    .style("fill", "rgb(213,222,217)") //this one will change
       .on("mouseover", function(e, d) {
            
            // console.log(d.properties.name)
                           
       })
       .on("click", function(e, d) {
        //    // apply a different color to the selected state
        //     d3.select(".state-selected").classed("state-selected", false)    

        //     d3.select(this).classed('state-selected', true) 

            let stateName = d.properties.name
            let abbr = stateNameToAbbr[stateName]
            let stateAvg = getStateAvg(mobilityData, stateName)
            stateNameHtml.text(`${stateName}`)
            stats.text("Avg Mobility Rate : " + (Math.round(stateAvg * 10000)/100).toFixed(2) + "%")
            tooltip.style("visibility", "visible")
            
            // stateSelected(d.properties.name)

            
            let collegeToMobilityRateAvg = getCollegeMobilityRates(mobilityData, abbr)

            // var colums = [
            //     {head: 'College', cl: 'title', html: d3.f('college')},
            //     {head: 'Avg. Mobility Rate', cl: 'num',  html: d3.f('mobilityRate', d3.format('.2f')) }

            // ]

            var columns = ['College', 'Mobility']

            console.log(collegeToMobilityRateAvg)

            // Need to remove something here probably

            d3.selectAll("table").remove();

            collegeTable.append("h4")
                        .text("Colleges with the highest Mobility")

            var table = d3.select("collegetable")
                                 
                                  .append('table')

            // console.log(table)
            
            let thead = table.append('thead')
            let tbody = table.append('tbody')

            thead.append('tr')
                .selectAll('th')
                .data(columns)
                .enter()
                .append('th')
                .text(d => d)

            var rows = tbody.selectAll('tr')
                            .data(collegeToMobilityRateAvg)
                            .enter()
                            .append('tr')
            
            var cells = rows.selectAll('td')
                            .data(function(row) {
                                return columns.map(function(column) {
                                    return {column: column, value: row[column]};
                                });
                            
                            })
                            .enter()
                            .append('td')
                            .html(d => d.value)

            
            


       })

		var w = 140, h = 300;

		var key = d3.select("map")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h)
                    .attr("class", "legend");

        var legend = key.append("defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "100%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", highColor)
            .attr("stop-opacity", 1);
            
        legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", lowColor)
            .attr("stop-opacity", 1);

        key.append("rect")
            .attr("width", w - 100)
            .attr("height", h)
            .style("fill", "url(#gradient)")
            .attr("transform", "translate(0,10)");

        var y = d3.scaleLinear()
            .range([h, 0])
            .domain([getMinMaxStateAverage(mobilityData)[0], getMinMaxStateAverage(mobilityData)[1]]);

        var yAxis = d3.axisRight(y);

        key.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(41,10)")
            .call(yAxis)
     
}


//Load external data and boot 
// Need to come back to this and figure out how the defer function works
// d3.queue()
//     .defer(d)

function load(error, usStates, mobilityData) {
    if (error) throw error

    let year = 1980
    let filteredData = mobilityData.filter( (x) => x.cohort == year)

    console.log(filteredData)

    generateMap(usStates, filteredData)

}


// d3.queue()
//     .defer(d3.json, usStatesFile)
//     .defer(d3.csv, mobilityDataFile)
//     .await(load)



//Load GeoJSON data 
(async () => {
    usStates = await d3.json(usStatesFile).then(usStates => usStates) 

    mobilityData = await d3.csv(mobilityDataFile).then(mobilityData => mobilityData) 

    let year = 1980
    let filteredData = mobilityData.filter( (x) => x.cohort == year)

    // console.log(filteredData)

    generateMap(usStates, filteredData)

})()



const stateNameToAbbr = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "District Of Columbia": "DC",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY"
  }