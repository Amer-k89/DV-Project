var mapData;
var worldData;
var projection;
var _3D_projection;
var render;
var path;
var statistics_data;
var current_view = '';
var sequentialScale;
var min_scale;
var max_scale;
var countries_info = undefined;
var selected_country = undefined;
var fileName = undefined; //'Data/CSVs/1970.042.csv' // 'Data/Map_data/Map_data.csv' //'Data/Map_data/Partitions/part37.csv' // 'Data/CSVs/1970.042' //
let isUpdate = false;
read_statistics();
read_countries_info();

function read_countries_info() {
  d3.json('data/countries.json', function (error, countries) {
    if (error) {
      console.log(error); //Log the error.
      throw error;
    }
    countries_info = countries;
  });
}

function draw_map() {
  d3.json('Data/Map_data/world2.json', function (error, world) {
    if (error) {
      console.log(error); //Log the error.
      throw error;
    }
    worldData = world;

    switch (selected_view) {
      case 'main':
        draw_2D_map(world);
        break;
      case '3D_Map':
        draw_3D_map();
        break;
      default:
      // code block
    }
    current_view = selected_view;
    read_map_data();
  });
}

function draw_2D_map(world) {
  var map_view = d3.select('#map_view');
  map_view.selectAll('*').remove();

  map_view.append('svg').attr('id', 'map_svg').attr('class', '_2d_map_view');

  var mapsvg = d3.select('#map_svg');
  let W = mapsvg.node().getBoundingClientRect().width;
  let H = mapsvg.node().getBoundingClientRect().height;
  var margin = { top: 0, right: 0, bottom: 0, left: 0 },
    width = W - margin.left - margin.right,
    height = H - margin.top - margin.bottom;

  mapsvg
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  mapsvg.append('g').attr('id', 'earth');
  let map = mapsvg.append('g').attr('id', 'map');

  projection = d3
    .geoNaturalEarth1()
    .scale(150)
    //.center([2.8, 41.9])
    .translate([width / 2, height / 2]);

  path = d3.geoPath().projection(projection);
  graticule = d3.geoGraticule10();


  var data = topojson.feature(world, world.objects.countries);

  //background
  map
    .append('path')
    .attr('fill', 'azure')
    .attr('class', 'map_background')
    .attr('stroke', '#553b54') //"#2a3f0e"
    .attr('stroke-width', 3)
    .style('opacity', '1')
    .attr('d', path({ type: 'Sphere' }));

  map
    .selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('class', 'countries')
    .attr('d', path)
    .style('opacity', '1')
    .attr('id', function (d) {
      return d.id;
    })
    .on('mouseover', function (d) {
      d3.select(this).style('stroke', 'red').attr('stroke-width', 2.5);
    })
    .on('mouseout', function (d) {
      d3.select(this).style('stroke', '#333').attr('stroke-width', 0.5);
    })
    .on('click', function (d) {
      selected_country = d.id;
      pause();
      Info_Dialog('info', d.id);
    })
    .append("title")
    .text(function (d) {
      result = countries_info.find(c => c.id == d.id);
      if (result !== undefined) {
        return ("  " + result.name + "  ");
      }
      else {
        return (" unknown Country ");
      }
    });

  map
    .append('path')
    .attr('d', path(graticule))
    .attr('id', 'graticule')
    .attr('stroke', '#999')
    .attr('class', 'grids')
    .style('opacity', '0.5')
    .style('pointer-events', 'none')
    .attr('fill', 'none');

  mapsvg.on("wheel.zoom", function () {
    var currScale = projection.scale();
    var zoom_f = 0;
    var zoom_r = 1;
    switch (true) {
      case currScale <= 200:
        zoom_r = 1;
        zoom_f = 0.2;
        break;
      case currScale <= 300:
        zoom_r = 1.5;
        zoom_f = 0.2;
        break;
      case currScale <= 400:
        zoom_r = 3;
        zoom_f = 0.2;
        break;
      case currScale <= 600:
        zoom_r = 5;
        zoom_f = 0.5;
        break;
      case currScale <= 800:
        zoom_r = 7;
        zoom_f = 0.5;
        break;
      case currScale <= 2000:
        zoom_r = 8;
        zoom_f = 1;
        break;
      case currScale <= 2800:
        zoom_r = 11;
        zoom_f = 2.5;
        break;
      case currScale <= 3500:
        zoom_r = 14;
        zoom_f = 3;
        break;
      case currScale <= 4500:
        zoom_r = 16;
        zoom_f = 3;
        break;
      case currScale <= 5500:
        zoom_r = 18;
        zoom_f = 3;
        break;
      default:
        zoom_r = 1;
        zoom_f = 1;
    }

    var newScale = currScale - zoom_f * event.deltaY;
    var currTranslate = projection.translate();
    var coords = projection.invert([event.offsetX, event.offsetY]);

    console.log("event.deltaY  :  " + event.deltaY);
    console.log("currScale  :  " + currScale);
    console.log("newScale  :  " + newScale);
    console.log("currTranslate  :  " + currTranslate);
    console.log("coords  :  " + coords);


    if (newScale > 50 && newScale < 5500) {
      projection.scale(newScale);
      var newPos = projection(coords);

      projection.translate([currTranslate[0] + (event.offsetX - newPos[0]), currTranslate[1] + (event.offsetY - newPos[1])]);
      mapsvg.selectAll(".map_background").attr("d", path({ type: 'Sphere' }));
      mapsvg.selectAll(".countries").attr("d", path);
      mapsvg.selectAll(".grids").attr('d', path(graticule))
      mapsvg.selectAll(".points")
        //.attr("d", path)
        .data(mapData)
        .attr('cx', function (d) {
          return projection(d.position)[0];
        })
        .attr('cy', function (d) {
          return projection(d.position)[1];
        })
        .attr('r', function (d) {
          let lat = Math.abs(d.position[1]);
          switch (true) {
            case lat <= 60:
              return 4 * zoom_r;
            case lat <= 70:
              return 6 * zoom_r;
            case lat <= 84:
              return 7 * zoom_r;
            case lat > 84:
              return 2 * zoom_r;
            default:
              return 5 * zoom_r;
          }
        })
    }


  })
    .call(d3.drag().on("drag", function () {
      var currTranslate = projection.translate();
      projection.translate([currTranslate[0] + d3.event.dx,
      currTranslate[1] + d3.event.dy]);
      mapsvg.selectAll(".map_background").attr("d", path({ type: 'Sphere' }));
      mapsvg.selectAll(".countries").attr("d", path);
      mapsvg.selectAll(".grids").attr('d', path(graticule))
      mapsvg.selectAll(".points")
        .data(mapData)
        .attr('cx', function (d) {
          return projection(d.position)[0];
        })
        .attr('cy', function (d) {
          return projection(d.position)[1];
        })
    }));







}

function CreateLegend() {
  d3.select('#legend_div').selectAll('*').remove();
  if (selected_data_type != 'equal_erea') {
    let unknown_legendsvg = d3
      .select('#legend_div')
      .append('svg')
      .attr('width', '13%')
      .attr('height', '55px');
    //.style('border-style','solid')
    let unknown_legendsvg_width =
      unknown_legendsvg.node().getBoundingClientRect().width * 0.7;
    unknown_legendsvg = unknown_legendsvg
      .append('g')
      .attr('class', 'legendWrapper')
      .attr(
        'transform',
        'translate(' +
        (unknown_legendsvg_width / 2 + unknown_legendsvg_width * 0.3) +
        ',25)'
      );

    //Draw the Rectangle
    unknown_legendsvg
      .append('rect')
      .attr('class', 'legendRect')
      .attr('x', -unknown_legendsvg_width / 2)
      .attr('y', 0)
      //.attr("rx", hexRadius*1.25/2)
      .attr('width', unknown_legendsvg_width)
      .attr('height', 10)
      .style('fill', 'rgb(128,128,128)');

    //Append title
    unknown_legendsvg
      .append('text')
      .attr('class', 'legendTitle')
      .attr('x', 0)
      .attr('y', -10)
      .style('text-anchor', 'middle')
      .text('Unknown');
  }
  let legendsvg = d3
    .select('#legend_div')
    .append('svg')
    .attr('width', '85%')
    .attr('id', 'temp_legend')
    .attr('height', '55px');

  var legendsvg_width = legendsvg.node().getBoundingClientRect().width;
  var legendWidth = legendsvg_width * 0.95;

  var countScale = d3
    .scaleLinear()
    .domain([min_scale, max_scale])
    .range([0, legendsvg_width]);

  //Calculate the variables for the temp gradient
  var numStops = 10;
  countRange = countScale.domain();
  countRange[2] = countRange[1] - countRange[0];
  countPoint = [];
  for (var i = 0; i < numStops; i++) {
    countPoint.push((i * countRange[2]) / (numStops - 1) + countRange[0]);
  }

  //Create the gradient
  legendsvg
    .append('defs')
    .append('linearGradient')
    .attr('id', 'legend-traffic')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%')
    .selectAll('stop')
    .data(d3.range(numStops))
    .enter()
    .append('stop')
    .attr('offset', function (d, i) {
      return countScale(countPoint[i]) / legendsvg_width;
    })
    .attr('stop-color', function (d, i) {
      return sequentialScale(countPoint[i]);
    });
  //Color Legend container
  legendsvg = legendsvg
    .append('g')
    .attr('class', 'legendWrapper')
    .attr('transform', 'translate(' + legendsvg_width / 2 + ',25)');

  //Draw the Rectangle
  legendsvg
    .append('rect')
    .attr('class', 'legendRect')
    .attr('x', -legendWidth / 2)
    .attr('y', 0)
    //.attr("rx", hexRadius*1.25/2)
    .attr('width', legendWidth)
    .attr('height', 10)
    .style('fill', 'url(#legend-traffic)');

  //Append title
  legendsvg
    .append('text')
    .attr('class', 'legendTitle')
    .attr('x', 0)
    .attr('y', -10)
    .style('text-anchor', 'middle')
    .text(function () {
      if (selected_data_type == 'Anomaly')
        return 'Anomaly Temperature'
      else
        return 'Avareged Temperature'
    });

  //Set scale for x-axis
  var xScale = d3
    .scaleLinear()
    .range([-legendWidth / 2, legendWidth / 2])
    .domain([min_scale, max_scale]);

  //Define x-axis
  var xAxis = d3.axisBottom(xScale);

  //Set up X axis
  legendsvg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,' + 10 + ')')
    .call(xAxis);
}

function color_map() {
  let map = d3.select('#map');
  let earth = d3.select('#earth');
  map.selectAll('.points').remove();
  if (selected_data_type == 'Anomaly') {
    map
      .selectAll('.countries')
      .style('opacity', '0.9')
      .style('fill', function (d) {
        country = mapData.find(element => element.country_id == d.id);
        if (country === undefined)
          return 'rgb(128,128,128)';
        else {
          if (country.temp_color)
            return country.temp_color;
          else
            return 'rgb(128,128,128)';
        }

      });
    map.selectAll('.map_background')
      .attr('fill', 'azure')
      .style('opacity', '0.6')
  } else {
    map.selectAll('.countries')
      .style('opacity', '0.4');
    map.selectAll('.map_background')
      .attr('fill', 'none')
    points = earth.selectAll('g').data(mapData).enter().append('g');

    var cell = points
      .append('circle')
      .attr('class', 'points')
      .attr('d', path)
      .attr('cx', function (d) {
        return projection(d.position)[0];
      })
      .attr('cy', function (d) {
        return projection(d.position)[1];
      })
      .style('pointer-events', 'none')
      .attr('r', function (d) {
        let lat = Math.abs(d.position[1]);
        switch (true) {
          case lat <= 60:
            return 4;
          case lat <= 70:
            return 6;
          case lat <= 84:
            return 7;
          case lat > 84:
            return 2;
          default:
            return 5;
        }
      })
      .style('opacity', '1')
      .attr('fill', function (d) {
        return d.temp_color;
      });
  }
}
function update() {
  if (selected_data_type == 'Anomaly') {
    min_scale = statistics_data.Anomaly_min_temp;
    max_scale = statistics_data.Anomaly_max_temp;
  } else {
    min_scale = statistics_data.EA_min_temp;
    max_scale = statistics_data.EA_max_temp;
  }
  sequentialScale = d3
    .scaleLinear() //scaleLinear
    .domain([min_scale, 0, max_scale])
    .range(['blue', '#ddd', 'red']);

  CreateLegend();
  draw_map(selected_view);
  draw_linechart();

  isUpdate = true;
}

function draw_linechart() {
  let global_div = d3.select('#global_div');
  global_div.selectAll('.global_chart').remove();
  if (selected_data_type == 'Anomaly') {
    //Line Chart
    const lineChartContainer = global_div
      .append('div')
      .attr('class', 'chart_container chart_container_lineChart global_chart')
      .attr('id', 'linechart');
    lineChartContainer.append('h2')
      .attr('id', "glople_climate_change_h2")
      .html("Glople Climate Change")
    lineChartContainer
      .append('div')
      .attr('class', 'tooltip')
      .attr('id', 'tooltip_line');
    const lineChartSVG = lineChartContainer
      .append('svg')
      .attr('style', 'overflow: visible');
    const lineChartGraphic = lineChartSVG
      .append('g')
      .attr('class', 'graphics');
    lineChartGraphic
      .append('g')
      .attr('class', 'y_axis_label')
      .append('text')
      .html('Mean temperature (°C)');
    lineChartGraphic
      .append('g')
      .attr('id', 'x_grid_linechart')
      .attr('class', 'grid');
    lineChartGraphic
      .append('g')
      .attr('id', 'y_grid_linechart')
      .attr('class', 'grid');
    lineChartGraphic.append('g').attr('class', 'uncertainty');
    lineChartGraphic.append('g').attr('class', 'line_chart_annual');
    lineChartGraphic.append('g').attr('class', 'line_chart_range_years');
    lineChartGraphic.append('g').attr('class', 'baselines');
    lineChartGraphic.append('g').attr('class', 'y_axis');
    lineChartGraphic.append('g').attr('class', 'x_axis');

    global_div
      .append('div')
      .attr('class', 'global_chart clear_div')
      .attr('id', 'clear_div')
      .style('clear', 'both');
    //Global Climate Stripes
    const Global_Climate_Stripes = global_div
      .append('div')
      .attr('class', 'chart_container chart_container_Stripes global_chart')
      .attr('id', 'stripesChartContainer')

    Global_Climate_Stripes.append('h2')
      .html("Glople Climate Stripes")
      .style('margin-bottom', '10px')
    Global_Climate_Stripes
      .append('div')
      .attr('class', 'tooltip')
      .attr('id', 'tooltip_stripes');
    Global_Climate_Stripes
      .append('svg')
      .attr('id', 'stripesChart');
    let dataFilePath = '../Data/GlobalSummary/GlobalSummary_' + selected_temperature_measure + '.csv'
    readAnomalyGlobalData(dataFilePath);
  }
  else {
    const HeatMapChartContainer = global_div
      .append('div')
      .attr('class', 'global_chart')
      .attr('id', 'heatmap_chart')

    HeatMapChartContainer.append('h2')
      .attr('id', "glople_heatmap_h2")
      .html("Glople HeatMap  ")
      .style('margin-bottom', '10px')
      .append('div')
      .attr('class', 'info_tooltip')
      .style('font-size', '15px')
      .html('&#x1F6C8;')
      .append('span')
      .style('font-size', '18px')
      .attr('class', 'info_tooltiptext')
      .attr('id', 'heatmap_info_tooltiptext')
      .html("The average tempreture of the world per month ");

    HeatMapChartContainer
      .append('div')
      .attr('class', 'tooltip')
      .attr('id', 'tooltip_heatmap');
    global_div.selectAll('#linechart').remove();
    global_div.selectAll('#heatmapchart').remove();
    let dataFilePath = '../Data/GlobalSummary/EqualAreaGlobalSummary_TAVG.csv';
    readEqualAreaGlobalData(dataFilePath);
  }

}

function readAnomalyGlobalData(dataFilePath) {
  d3.csv(dataFilePath, function (error, csv) {
    if (error) {
      console.log(error);
      throw error;
    }
    csv.forEach(function (d) {
      d.date = parseTime(d.Year + '-' + d.Month);
      d.Year = +d.Year;
      d.Month = +d.Month;
      d.MonthlyAnomaly = +d.MonthlyAnomaly;
      d.MonthlyUnc = +d.MonthlyUnc;
      d.AnnualAnomaly = +d.AnnualAnomaly;
      d.AnnualUnc = +d.AnnualUnc;
      d.FiveYearsAnomaly = +d.FiveYearsAnomaly;
      d.FiveYearsUnc = +d.FiveYearsUnc;
      d.TenYearsAnomaly = +d.TenYearsAnomaly;
      d.TenYearsUnc = +d.TenYearsUnc;
      d.TwentyYearsAnomaly = +d.TwentyYearsAnomaly;
      d.TwentyYearsUnc = +d.TwentyYearsUnc;
      d.absoluteTemp = +d.absoluteTemp;
      d.absoluteTempUnc = +d.absoluteTempUnc;
    });
    let chart_year = undefined;
    switch (selected_data_year) {
      case 'Annual':
        chart_year = "annual";
        break;
      case 'FiveYears':
        chart_year = "five";
        break;
      case 'TenYears':
        chart_year = "ten";
        break;
      case 'TwentyYears':
        chart_year = "twenty";
        break;

    }

    draw_global_Chart(csv, chart_year, 'linechart', isUpdate);
    draw_global_Strips(csv, 'stripesChartContainer', chart_year);
  });
}

function readEqualAreaGlobalData(dataFilePath) {
  d3.csv(dataFilePath, function (error, csv) {
    if (error) {
      console.log(error);
      throw error;
    }
    csv.forEach(function (d) {
      y = d.date.substring(0, 4)
      m = d.date.substring(5, 8)
      switch (m) {
        case "041":
          m = "Jan";
          break;
        case "125":
          m = "Feb";
          break;
        case "208":
          m = "Mar";
          break;
        case "292":
          m = "Apr";
          break;
        case "375":
          m = "May";
          break;
        case "458":
          m = "Jun";
          break;
        case "542":
          m = "Jul";
          break;
        case "625":
          m = "Aug";
          break;
        case "708":
          m = "Sep";
          break;
        case "792":
          m = "Oct";
          break;
        case "875":
          m = "Nov";
          break;
        case "958":
          m = "Dec";
          break;
      }
      d.date = parseTime(y + '-' + m);
      d.Year = +y;
      d.Month = m;
      d.temp = +d.temp
    });

    draw_global_heatmap(csv, 'heatmap_chart');
  });
}


function read_statistics() {
  d3.csv('Data/Map_data/statistics.csv', function (error, csv) {
    if (error) {
      console.log(error); //Log the error.
      throw error;
    }
    csv.forEach(function (d) {
      k = Object.keys(d);
      v = Object.values(d);
      statistics_data = new Object();
      statistics_data.EA_min_temp = v[0];
      statistics_data.EA_max_temp = v[1];
      statistics_data.EA_min_date = v[2];
      statistics_data.EA_max_date = v[3];
      statistics_data.EA_months_count = v[4];
      statistics_data.Anomaly_min_temp = v[5];
      statistics_data.Anomaly_max_temp = v[6];
      statistics_data.Anomaly_min_date = v[7];
      statistics_data.Anomaly_max_date = v[8];
      statistics_data.Anomaly_year_count = v[9];

      update();
    });
  });
}

function read_map_data() {
  if (selected_data_type == 'Anomaly') {
    if (!fileName)
      fileName =
        'Data/Years/1743/' +
        selected_temperature_measure +
        '_' +
        selected_data_year +
        'Anomaly.csv';
    mapData = [];
    d3.csv(fileName, function (error, csv) {
      if (error) {
        console.log(error);
        map.selectAll(".countries")
          .style("fill", "rgb(128,128,128)");
        map.selectAll('.map_background')
          .attr('fill', 'azure')
        throw error;
      }
      csv.forEach(function (d) {
        k = Object.keys(d);
        v = Object.values(d);
        let obj = new Object();
        obj.country_id = Number(v[1]);
        obj.alpha3_code = v[2];
        obj.temp = v[3];
        if (obj.temp)
          obj.temp_color = sequentialScale(obj.temp);
        else
          obj.temp_color = "rgb(128,128,128)";
        mapData.push(obj);
      });
      color_map();
    });
    create_year_slider([
      new Date(statistics_data.Anomaly_min_date),
      new Date(statistics_data.Anomaly_max_date),
    ]);
  } else {
    mapData = [];
    if (!fileName) fileName = 'Data/CSVs/1970.042.csv';
    d3.csv(fileName, function (error, csv) {
      if (error) {
        console.log(error);
        throw error;
      }
      csv.forEach(function (d) {
        k = Object.keys(d);
        v = Object.values(d);
        let position = [Number(v[0]), Number(v[1])];
        let temp = Number(v[2]);
        var obj = new Object();
        obj.position = position;
        obj.temp = temp;
        if (temp)
          obj.temp_color = sequentialScale(temp);
        else
          obj.temp_color = "rgb(128,128,128)";
        mapData.push(obj);
      });
      color_map();
      create_year_slider([
        new Date(statistics_data.EA_min_date),
        new Date(statistics_data.EA_max_date),
      ]);
    });

  }
}

function draw_3D_map() {
  var map_view = d3.select('#map_view');
  map_view.selectAll('*').remove();
  map_view.append('h2')
    .html("")
    .style('position', 'absolute')
    .style('margin', '20px')
    .attr('id', '_3d_country_name');
  _3d_map_view = map_view.append('div')
    .attr('class', '_3d_map_view')
    .attr('align', 'center')
  var canvas = _3d_map_view
    .append('canvas')
    .attr('id', '_3d_canvas')
    .attr('height', '450')
    .attr('width', '600');

  var width = canvas.property('width'),
    height = canvas.property('height'),
    context = canvas.node().getContext('2d');

  _3D_projection = d3
    .geoOrthographic() //geoOrthographic // geoNaturalEarth1
    .scale((height - 10) / 2)
    .translate([width / 2, height / 2])
    .precision(0.1);
    var path = d3.geoPath().projection(_3D_projection).context(context);

    canvas.on("wheel.zoom", function () {
      var currScale = _3D_projection.scale();
      var zoom_f = 0;
      switch (true) {
        case currScale <= 400:
          zoom_f = 0.2;
          break;
        case currScale <= 800:
          zoom_f = 0.5;
          break;
        case currScale <= 2000:
          zoom_f = 1;
          break;
        case currScale <= 2800:
          zoom_f = 2.5;
          break;
        case currScale <= 5500:
          zoom_f = 3;
          break;
        default:
          zoom_f = 1;
      }
  
      var newScale = currScale - zoom_f * event.deltaY;
      var currTranslate = _3D_projection.translate();
      var coords = _3D_projection.invert([event.offsetX, event.offsetY]);
  
      if (newScale > 50 && newScale < 5500) {
        _3D_projection.scale(newScale);
        var newPos = _3D_projection(coords);
        _3D_projection.translate([currTranslate[0] + (event.offsetX - newPos[0]), currTranslate[1] + (event.offsetY - newPos[1])]);
        render();

      }
    });


  canvas  //
    .call(d3.drag().on('start', dragstarted).on('drag', dragged))
    .on('mousemove', _3d_mousemove)
    .on('click', _3d_mouseClick);


  var sphere = { type: 'Sphere' },
    _3d_land = topojson.feature(worldData, worldData.objects.countries);

  render = function () { };
  var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
    r0, // Projection rotation as Euler angles at start.
    q0; // Projection rotation as versor at start.

  function dragstarted() {
    v0 = versor.cartesian(_3D_projection.invert(d3.mouse(this)));
    r0 = _3D_projection.rotate();
    q0 = versor(r0);
  }

  function dragged() {
    var v1 = versor.cartesian(_3D_projection.rotate(r0).invert(d3.mouse(this))),
      q1 = versor.multiply(q0, versor.delta(v0, v1)),
      r1 = versor.rotation(q1);
    _3D_projection.rotate(r1);
    render();
  }

  function create_3D_map() {
    render = function () {
      context.clearRect(0, 0, width, height);
      context.beginPath(),
        path(sphere),
        (context.fillStyle = '#fff'),
        context.fill();
      context.beginPath(),
        path(_3d_land),
        (context.fillStyle = '#000'),
        context.stroke();
      context.beginPath(), path(sphere), context.stroke();
      _3d_land.features.forEach(element => {
        let color;
        country = mapData.find(c => c.country_id == element.id);
        if (country === undefined) color = 'rgb(180,180,180)';
        else color = country.temp_color;
        context.beginPath(),
          path(element),
          (context.fillStyle = color),
          context.fill();
      });
      if (_3D_currentCountry) {
        context.beginPath(),
          path(_3D_currentCountry),
          (context.fillStyle = 'red'),
          context.stroke();

      }
    };
    render();
  }
  var _3D_currentCountry;
  function enter(country) {
    result = countries_info.find(c => c.id == country.id);
    if (result) {
      d3.select('#_3d_country_name').html(result.name)
    }
  }
  function leave(country) {
    context.beginPath(),
      path(country),
      (context.fillStyle = '#000'),
      context.stroke();
    d3.select('#_3d_country_name').html("")
  }
  function _3d_mousemove() {
    var c = getCountry(this);
    if (!c) {
      if (_3D_currentCountry) {
        leave(_3D_currentCountry);
        _3D_currentCountry = undefined;
        render();
      }
      return;
    }
    if (c === _3D_currentCountry) {
      return;
    }
    _3D_currentCountry = c;
    render();
    enter(c)
  }
  function _3d_mouseClick() {
    var c = getCountry(this);
    if (!c) {
      return;
    }
    selected_country = c.id;
    pause();
    Info_Dialog('info', c.id);
  }

  function getCountry(event) {
    var pos = _3D_projection.invert(d3.mouse(event));
    return _3d_land.features.find(function (f) {
      return f.geometry.coordinates.find(function (c1) {
        return (
          polygonContains(c1, pos) ||
          c1.find(function (c2) {
            return polygonContains(c2, pos);
          })
        );
      });
    });
  }
  function polygonContains(polygon, point) {
    var n = polygon.length;
    var p = polygon[n - 1];
    var x = point[0],
      y = point[1];
    var x0 = p[0],
      y0 = p[1];
    var x1, y1;
    var inside = false;
    for (var i = 0; i < n; ++i) {
      (p = polygon[i]), (x1 = p[0]), (y1 = p[1]);
      if (y1 > y !== y0 > y && x < ((x0 - x1) * (y - y1)) / (y0 - y1) + x1)
        inside = !inside;
      (x0 = x1), (y0 = y1);
    }
    return inside;
  }

  create_3D_map();
}

function Info_Dialog(info, code) {
  var result = undefined;

  result = countries_info.find(c => c.id == code);
  const chart = document.getElementById('dialogCountryLinechart');

  if (result === undefined || result.length == 0) {
    $('#country_info_name').text('Country : ' + code);
    $('#country_info_flag').attr('src', 'data/flags/unknown.png');
    putHottestColdest(undefined);
    chart.classList.add('removeDisplay');
  } else {
    var name = result.name;
    var image = 'data/flags/' + result.alpha2 + '.png';
    $('#country_info_name').text('Country : ' + name);
    $('#country_info_flag').attr('src', image);
    chart.classList.remove('removeDisplay');
    ReadData(result.alpha3.toUpperCase());
  }
  if (info != undefined) {
  } else {
  }
  $('#Info_Dialog').dialog('open');
}
