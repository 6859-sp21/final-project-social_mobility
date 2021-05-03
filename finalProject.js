
const body = d3.select("body").node()
// var map = d3.select("map").node()
var width  = window.innerWidth
var height = window.innerHeight

console.log(height)
console.log(width)

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

const getCollegeMobilityRates = (mobilityData, abbr) => {
        let filtered = mobilityData.filter( x => x.state === abbr)

        let nullRemoved = filtered.filter(isMobilityRateNotNan)
        

        let sorted = nullRemoved.sort((x,y) =>  {return parseFloat(y.mr_kq5_pq1)- parseFloat(x.mr_kq5_pq1)}).slice(0,10)

        let result = []

        for (const object of sorted) { 
            result[object.name] = object[mobilityRate]
        }

        return  result
}

const generateMap = (stateData, mobilityData) => {

    console.log(getMinMaxStateAverage(mobilityData))

    var colorScale = d3.scaleLinear()
                        .range(["#D4EEFF", "#0099FF"])
                        .interpolate(d3.interpolateLab)
                        .domain(getMinMaxStateAverage(mobilityData))

    console.log(d3.extent(mobilityData, (d) => { return parseFloat(d[mobilityRate])}))

    const getColor = (d) => {
        let stateName = d.properties.name
        let stateAbbr = stateNameToAbbr[stateName]

        let stateData = mobilityData.filter( row  => row.state == stateAbbr)

        // console.log(stateData[0][mobilityRate])
        let stateMobilityData = stateData.map((x) => {return parseFloat(x[mobilityRate])})
        // console.log(stateMobilityData)

        let stateAverage = d3.mean(stateMobilityData)

        // console.log(stateAverage)
        
        return colorScale(stateAverage)

    }

    // console.log(stateData)
    var projection = d3.geoAlbersUsa()
                        .translate([width/4, height/2])
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
    
    const stateNameHtml = d3.select("state")

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

            // console.log()

            return getColor(d)
       })
    //    .style("fill", "rgb(213,222,217)") //this one will change
       .on("mouseover", function(e, d) {
            

            
            // console.log(d.properties.name)
                           
       })
       .on("click", function(e, d) {
           // apply a different color to the selected state
            d3.select(".state-selected").classed("state-selected", false)    

            d3.select(this).classed('state-selected', true) 

            let stateName = d.properties.name
            let abbr = stateNameToAbbr[stateName]
            let stateAvg = getStateAvg(mobilityData, stateName)
            stateNameHtml.text(`${stateName}`)
            stats.text(`Avg Mobility Rate : ${stateAvg}`)
            tooltip.style("visibility", "visible")
            stateSelected(d.properties.name)

            
            let collegeToMobilityRateAvg = getCollegeMobilityRates(mobilityData, abbr)

            let blue  = ["christa", "jebi", 'mbrim']

            
            // collegeTable.selectAll('div')
            //     .data(blue)
            //     .enter()
            //     .append('div')
            //     .text('blah)


       })

    function stateSelected(stateName) {

    }
       
}






//Load GeoJSON data 
(async () => {
    usStates = await d3.json(usStatesFile).then(usStates => usStates) //doesn't feel like US states is a descriptive enough variable

    mobilityData = await d3.csv(mobilityDataFile).then(mobilityData => mobilityData) 
    //will do some filtering of the data here

    let year = 1980
    let filteredData = mobilityData.filter( (x) => x.cohort == year)

    console.log(filteredData)
    // console.log(mobilityData.filter(x => x.state === 'NY'))
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