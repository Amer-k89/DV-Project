

//Read the data

function draw_global_heatmap(data,chartId)
{
// set the dimensions and margins of the graph
global_fullWidth = d3.select(`#${chartId}`).node().getBoundingClientRect().width ;
global_fullheight = d3.select(`#${chartId}`).node().getBoundingClientRect().height ;
let heatMap_margin = {top: 30, right: 30, bottom: 70, left: 40},
heatMap_width = 450 - heatMap_margin.left - heatMap_margin.right,
heatMap_height = 550 - heatMap_margin.top - heatMap_margin.bottom;

// append the svg object to the body of the page
let svg = d3.select(`#${chartId}`)
.append("svg")
  .attr("width", heatMap_width + heatMap_margin.left + heatMap_margin.right)
  .attr("height", heatMap_height + heatMap_margin.top + heatMap_margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + heatMap_margin.left + "," + heatMap_margin.top + ")");

var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

var x = d3.scaleBand().range([0,heatMap_width]).padding(0.1);
x.domain(months);
var y = d3.scaleLinear().rangeRound([heatMap_height, 0]);
y.domain([
    d3.min(data, function (d) {return d.Year;}),
    d3.max(data, function (d) {return d.Year;})
]);

let yearcounts =d3.max(data, function (d) {return d.Year;})-d3.min(data, function (d) {return d.Year;})+1;


svg.append("g")
  .attr("transform", "translate(0," + heatMap_height + ")")
  .call(d3.axisBottom(x))

// Build X scales and axis:

svg.append("g")
  .call(d3.axisLeft(y));


 let min_temp = d3.min(data, function (d) {return d.temp;});
 let max_temp =d3.max(data, function (d) {return d.temp;});
// Build color scale
var myColor = d3
.scaleLinear() //scaleLinear
.domain([
    min_temp,0,
    max_temp
])
.range(['blue', '#ddd', 'red']);

let ticks=25;
var legend_data = d3.range(ticks);

var legend_scale = d3.scaleLinear().rangeRound([0,heatMap_width]);
legend_scale.domain([
    min_temp,
    max_temp
]);

  // Build legend:
  svg.append("g")
  .attr("transform", "translate(0," + (heatMap_height +50)+ ")")
  .call(d3.axisBottom(legend_scale))

  

  svg.selectAll()
	.data(legend_data)
	.enter()
	.append("rect")
    .attr("transform", "translate(0," + (heatMap_height +33)+ ")")
    .attr("height", "15px" )
	.attr("x", (d,i)=>i*(heatMap_width/ticks))
	.attr("width", heatMap_width/ticks)
	.attr("fill",function(d,i){
       return myColor(legend_scale.invert(i*(heatMap_width/ticks)));
    } );

  svg.selectAll()
  .data(data)
  .enter()
  .append("rect")
  .attr("x", function(d) { return x(d.Month) })
  .attr("y", function(d) { return y(d.Year) -heatMap_height/yearcounts})
  .attr("width", x.bandwidth() )
  .attr("height", function (d) {
    return (heatMap_height/yearcounts);
} )
  .style("fill", function(d) { return myColor(d.temp)} )
  .on('mouseover', function (d) {
    d3.select(this).style('stroke', 'black').attr('stroke-width', 2.5);
  })
  .on('mouseout', function (d) {
    d3.select(this).style('stroke', 'none');
  })
  .append('title').text(function(d)
  {
      return d.Year +"-"+d.Month+" [ "+Number(d.temp).toFixed(3)+" C ]" ;
  });
}
