




    var margin={top: 50, left:50,right:50,bottom:50},
    height=650-margin.top-margin.bottom,
    width=1000-margin.left-margin.right;

var colorscal=d3.scaleSequential(d3.interpolateBuPu).domain([0,70000])
var colorscalTwo=d3.scaleSequential(d3.interpolateBuPu).domain([19000,70000])

var svg = d3.select("#map").append("svg")
    .attr("width",width+margin.left+margin.right)
    .attr("height",height+margin.top+margin.bottom)
    .append("g")
    .attr("transform","translate("+margin.left+","+margin.top+")");
    
var svgTwo = d3.select("#secondMap").append("svg")
.attr("width",width+margin.left+margin.right)
.attr("height",height+margin.top+margin.bottom)
.append("g")
.attr("transform","translate("+margin.left+","+margin.top+")");



/*d3.queue()
    .defer(d3.json, "data/usa_map.topojson")
    .defer(d3.csv,"data/gdp_per_capita.csv")
    .await(ready);*/



var projection=d3.geoAlbersUsa() 
.translate([width / 2, height / 2]) // translate to center of screen
.scale([1000]);  

/*var tooltip = d3.select("body").append("div") 
.attr("class", "tooltip text-primary border border-primary")       
.style("opacity", 0);8*/

/*var tooltip = d3.select("#newTooltip")
.attr("class", "tooltip text-primary border border-primary")       
.style("opacity", 0);*/




var newTooltip = d3.select("body").append("div") 
.attr("class", "newTooltip text-primary border border-primary")       
.style("opacity", 0);

var countyTooltip=d3.select("body").append("div") 
.attr("class", "newTooltip text-primary border border-primary")       
.style("opacity", 0);


var path=d3.geoPath()
.projection(projection);
            
var us_map=d3.json("data/us_states.topojson").then(function(data){
return data;
});

var gdp_data=d3.csv("data/gdp_per_capita.csv").then(function(data){
return data;
})   

var countymap=d3.json("data/us_county_20m.json").then(function(data){
return data;
    });

var per_capita_county=d3.csv("data/personal_income_counties(original).csv").then(function(data){
return data;
});


Promise.all([us_map,gdp_data,countymap,per_capita_county]).then(function(values){
var states=topojson.feature(values[0],values[0].objects.us_states).features

var gdp_per_capita_data=values[1]

var counties=topojson.feature(values[2],values[2].objects.cb_2017_us_county_20m).features

var county_personal_income=values[3]


//Match state data with state geo data
for (var i = 0; i < gdp_per_capita_data.length; i++) {
    
    // Grab State Name
    var dataState =gdp_per_capita_data[i].State;
        // Grab data value 
    var dataValue =+ gdp_per_capita_data[i].gdp_per_capita;

    // Find the corresponding state inside the GeoJSON
    for (var j = 0; j < 52; j++)  {
        var topojsonState=values[0].objects.us_states.geometries[j].properties.name

        if (dataState == topojsonState) {

        // Copy the data value into the JSON
       values[0].objects.us_states.geometries[j].properties.gdp=+ dataValue
        //console.log(gdptoJson)
        // Stop looking through the JSON
        break;
        }
    }
}

//match county data with county geo data
for (var i = 0; i < county_personal_income.length; i++) {
    
    // Grab county Income
    var dataCounty =county_personal_income[i].Id;
    // Grab data value 
    var dataCountyValue =+ county_personal_income[i].MedianIncome;
    // Grab conuty Name
    var dataCountyName=county_personal_income[i].Geography

    // Find the corresponding state inside the GeoJSON
    for (var j = 0; j < 3220; j++)  {
        var topojsonCounty=values[2].objects.cb_2017_us_county_20m.geometries[j].properties.AFFGEOID

        if (dataCounty == topojsonCounty) {

        // Copy the data value into the JSON
       values[2].objects.cb_2017_us_county_20m.geometries[j].properties.countyIncome=+ dataCountyValue
        //console.log(gdptoJson)
        //copy the county name
        values[2].objects.cb_2017_us_county_20m.geometries[j].properties.countyName= dataCountyName

        // Stop looking through the JSON
        break;
        }
    }


}

console.log(values[2])

//state level map
svg.selectAll(".state")
.data(states)
.enter()
.append("path")
.attr("class","state")
.attr("d", path)
.style("stroke", "#fff")
.style("stroke-width", "1")
.style("fill", function(d,i) { 
	var value =states[i].properties.gdp
        return colorscal(value)

        })
.on("mouseover", function(d,i) {    
    newTooltip.transition()    
.duration(200)    
.style("opacity", .9);  

var formattedNumber=d3.format(",.2f");
newTooltip.html("<h4>"+states[i].properties.name+"</h4><table>"+
"<tr><td>GDP Per Capita:</td><td>"+"$"+formattedNumber(states[i].properties.gdp)+"</td></tr>")  
            .style("left", (d3.event.pageX) + "px")   
            .style("top", (d3.event.pageY - 20) + "px");  
          })          
.on("mouseout", function(d) {   
newTooltip.transition()    
.duration(500)    
.style("opacity", 0); 
          });

//County level map
svgTwo.selectAll(".county")
.data(counties)
.enter()
.append("path")
.attr("class","state")
.attr("d", path)
.style("stroke", "#fff")
.style("stroke-width", "1")
.style("fill", function(d,i) { 
	var value =counties[i].properties.countyIncome
        return colorscalTwo(value)

        })
        .on("mouseover", function(d,i) {    
            countyTooltip.transition()    
        .duration(200)    
        .style("opacity", .9);  
        
        var formattedNumber=d3.format(",.2f");
        countyTooltip.html("<h4>"+counties[i].properties.countyName+"</h4><table>"+
        "<tr><td>GDP Per Capita:</td><td>"+"$"+formattedNumber(counties[i].properties.countyIncome)+"</td></tr>")  
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY - 20) + "px");  
                  })          
        .on("mouseout", function(d) {   
        countyTooltip.transition()    
        .duration(500)    
        .style("opacity", 0); 
                  });
        


});


