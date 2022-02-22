let years = [];

//Helper functions
function setSuitableYears(data, type) {
  years = [];
  const neededData = data.filter(d => d.Month === 6);
  const fieldName =
    type === 'annual'
      ? 'AnnualAnomaly'
      : type[0].toUpperCase() + type.slice(1) + 'YearsAnomaly';
  let startYear = 0;
  for (let i = 0; i < neededData.length; i++) {
    const currentObj = neededData[i];
    if (isNaN(currentObj[fieldName])) continue;
    else {
      let found = false;
      for (let j = i; j < i + 50; j++) {
        if (isNaN(neededData[j][fieldName])) {
          found = true;
          break;
        }
      }
      if (found) continue;
      else {
        startYear = currentObj.Year;
        break;
      }
    }
  }
  for (let i = startYear; i <= 2020; i++) years.push(i);
}

// Data handel

function handelData(data, type) {
  const neededData = data.filter(d => d.Month === 6);
  const existedYears = neededData.map(d => d.Year);
  const retData = [];
  let counter = 0;
  const fieldName =
    type === 'annual'
      ? 'AnnualAnomaly'
      : type[0].toUpperCase() + type.slice(1) + 'YearsAnomaly';
  years.forEach(year => {
    if (existedYears.find(currentYear => year === currentYear)) {
      const index = neededData.findIndex(d => d.Year === year);
      retData.push(neededData[index]);
    } else {
      retData[counter] = {
        Year: year,
      };
      retData[counter][fieldName] = +'Nan';
    }
    counter++;
  });

  return retData;
}

// Colors function

function getColorStripes(d, data, type) {
  const fieldName =
    type === 'annual'
      ? 'AnnualAnomaly'
      : type[0].toUpperCase() + type.slice(1) + 'YearsAnomaly';

  const extent = d3.extent(data, d => d[fieldName]);

  /*const colors = d3
    .scaleDiverging(c => d3.interpolateRdBu(1 - c))
    .domain([extent[0], 0, extent[1]]);*/

    const colors = d3
    .scaleLinear() //scaleLinear
    .domain([extent[0], 0, extent[1]])
    .range(['blue', '#ddd', 'red']);

  if (isNaN(d[fieldName])) return '#999999';
  else return colors(d[fieldName]);
}

// init the graoh

function initgraph(chartId, svg, xScale, yScale, data, type) {
  svg
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom - stripChartHight)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const xAxis = d3
    .axisBottom()
    .scale(xScale)
    .ticks(6)
    .tickFormat(d3.format('.0f'));

  svg
    .append('g')
    .attr('transform', 'translate(0,' + yScale(0.8) + ')')
    .call(xAxis)
    .remove();

  const stripWidth = width / years.length;

  const stripes = svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'stripes')
    .attr('width', stripWidth)
    .attr('x', d => {
      return xScale(d.Year);
    })
    .attr('y', yScale(0))
    .attr('height', yScale(0.8))
    .attr('fill', d => getColorStripes(d, data, type));

  stripes
    .on('mouseenter', function ( data) {
      enter(this, data, type, chartId);
    })
    .on('mouseout', function () {
      leave(chartId);
    })
    .on('mousemove', function () {
      move(this, chartId);
    });
}

function enter(self, data, type, chartId) {
  const fieldName =
    type === 'annual'
      ? 'AnnualAnomaly'
      : type[0].toUpperCase() + type.slice(1) + 'YearsAnomaly';
  const uncFieldName =
    type === 'annual'
      ? 'AnnualUnc'
      : type[0].toUpperCase() + type.slice(1) + 'YearsUnc';
  const tooltip = d3.select(`#${chartId}`).select('.tooltip');
  tooltip.transition();

  const text = String(
    "<p style='text-align: center; font-weight: bold; font-size: 13px'>" +
      data.Year +
      '</p>' +
      "<p style='text-align: center; font-weight: bold; font-size: 12px'> " +
      (isNaN(data[fieldName])
        ? 'unknown'
        : data[fieldName].toFixed(2) + ' &deg;C ') +
      (isNaN(data[fieldName])
        ? ''
        : ' &plusmn; ' + data[uncFieldName].toFixed(2)) +
      ' </p>'
  );
  let id =`#${chartId}`;
  let tipbox = document.getElementById(chartId).getBoundingClientRect();
  let pointer = d3.mouse(d3.select(id).node());
  tooltip
  .style('left', function () {
    return (String(tipbox.left+pointer[0] + 10) + 'px');
})
    .style('top', function () {
      return (String(tipbox.top+pointer[0] + 10) + 'px');
  })
    .style('display', 'block')
    .html(text);
}

function leave(chartId) {
  const tooltip = d3.select(`#${chartId}`).select('.tooltip');
  if (tooltip) tooltip.style('display', 'none');
}

function move(self, chartId) {
  const tooltip = d3.select(`#${chartId}`).select('.tooltip');
  let id =`#${chartId}`;
  let tipbox = document.getElementById(chartId).getBoundingClientRect();
  let pointer = d3.mouse(d3.select(id).node());
  tooltip
  .style('left', function () {
    return (String(tipbox.left+pointer[0] + 10) + 'px');
})
    .style('top', function () {
      return (String(tipbox.top+pointer[1] - 60) + 'px');
  })
}

// Generate Scales functions

function generateScalesStripes() {
  const xScale = d3
    .scaleTime()
    .domain(
      d3.extent(years, function (d) {
        return d;
      })
    )
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, height / 3]);

  return [xScale, yScale];
}

//Drawing Function
function drawStrips(data, chartId, type) {
  setSuitableYears(data, type);
  const presentedData = handelData(data, type);

  const scales = generateScalesStripes();
  const [xScale, yScale] = scales;

  let svg = d3.select(`#${chartId}`).select('#stripesChart');
  const containtedG = svg.select('g');
  if (containtedG.empty()) {
    initgraph(chartId, svg, xScale, yScale, presentedData, type);
  }

  const stripWidth = width / years.length;

  const stripes = svg.selectAll('.stripes').data(presentedData);
  stripes.exit().remove();

  stripes
    .data(presentedData)
    .attr('x', d => {
      return xScale(d.Year);
    })
    .attr('width', stripWidth)
    .attr('y', yScale(0))
    .attr('height', yScale(1))
    .attr('fill', d => getColorStripes(d, data, type))
    .merge(stripes)
    .on('mouseover', function (d) {
      enter(this, d, type, chartId);
    })
    .on('mouseout', function () {
      leave(chartId);
    });
}

function draw_global_Strips(data, chartId, type) {
  global_fullWidth = d3.select(`#${chartId}`).node().getBoundingClientRect().width;
  margin = { top: 0, right: 0, bottom: 0, left: 10 };
  width = global_fullWidth - margin.left - margin.right;
  height = (global_fullWidth * 12) / 16 - margin.top - margin.bottom;
  stripChartHight=220;
  drawStrips(data, chartId, type);
}