const countriesPath = '../Data/CountriesWithCodes.csv';
const avgExtention = '_AnnomalyAVG.csv';
const countryFolderData = '../Data/Countries/';

const chartFullWidth = 600;
const chartMargin = { top: 40, right: 70, bottom: 30, left: 50 };
const chartWidth = chartFullWidth - chartMargin.left - chartMargin.right;
const chartHeight =
  (chartFullWidth * 7) / 16 - chartMargin.top - chartMargin.bottom;
const labelHight = 200;
const uncThreshold = 1;
const parseTime = d3.timeParse('%Y-%m');
let countries, countryAVG;

// Generate Axis scales
function getScales(data, type) {
  const x = d3
    .scaleTime()
    .domain(
      d3.extent(data, function (d) {
        return d.date;
      })
    )
    .range([0, chartWidth]);

  const y = d3
    .scaleLinear()
    .domain([
      d3.min(data, function (d) {
        if (type === 'annual') {
          return d.AnnualAnomaly - d.AnnualUnc - 0.5 + d.absoluteTemp;
        } else {
          return (
            d.AnnualAnomaly -
            d[type[0].toUpperCase() + type.slice(1) + 'YearsUnc'] -
            0.5 +
            d.absoluteTemp
          );
        }
      }),
      d3.max(data, function (d) {
        if (type === 'annual') {
          return d.AnnualAnomaly + d.AnnualUnc + 0.5 + d.absoluteTemp;
        } else {
          return (
            d.AnnualAnomaly +
            d[type[0].toUpperCase() + type.slice(1) + 'YearsUnc'] +
            0.5 +
            d.absoluteTemp
          );
        }
      }),
    ])
    .range([chartHeight, 0]);

  return [x, y];
}

// Generate Lines
function lineGenerators(xScale, yScale) {
  const annualLineGenerator = d3
    .line()
    .x(function (d) {
      return xScale(d.date);
    })
    .y(function (d) {
      return yScale(d.AnnualAnomaly + d.absoluteTemp);
    })
    .defined(function (d) {
      return !isNaN(d.AnnualAnomaly);
    });

  const fiveYearsLineGenerator = d3
    .line()
    .x(function (d) {
      return xScale(d.date);
    })
    .y(function (d) {
      return yScale(d.FiveYearsAnomaly + d.absoluteTemp);
    })
    .defined(function (d) {
      return !isNaN(d.FiveYearsAnomaly);
    });

  const tenYearsLineGenerator = d3
    .line()
    .x(function (d) {
      return xScale(d.date);
    })
    .y(function (d) {
      return yScale(d.TenYearsAnomaly + d.absoluteTemp);
    })
    .defined(function (d) {
      return !isNaN(d.TenYearsAnomaly);
    });

  const twentyYearsLineGenerator = d3
    .line()
    .x(function (d) {
      return xScale(d.date);
    })
    .y(function (d) {
      return yScale(d.TwentyYearsAnomaly + d.absoluteTemp);
    })
    .defined(function (d) {
      return !isNaN(d.TwentyYearsAnomaly);
    });

  const baseLine = d3
    .line()
    .x(function (d) {
      return xScale(d.date);
    })
    .y(function (d) {
      return yScale(d.absoluteTemp);
    });

  return [
    annualLineGenerator,
    baseLine,
    fiveYearsLineGenerator,
    tenYearsLineGenerator,
    twentyYearsLineGenerator,
  ];
}

// Draw uncertinity area on graph
function drawUncertinityArea(svg, data, xScale, yScale, type) {
  const uncertinityArea = d3
    .area()
    .x(function (d) {
      return xScale(d.date);
    })
    .y0(function (d) {
      if (type === 'annual') {
        return yScale(d.AnnualAnomaly + d.AnnualUnc + d.absoluteTemp);
      } else {
        return yScale(
          d[type[0].toUpperCase() + type.slice(1) + 'YearsAnomaly'] +
            d[type[0].toUpperCase() + type.slice(1) + 'YearsUnc'] +
            d.absoluteTemp
        );
      }
    })
    .y1(function (d) {
      if (type === 'annual') {
        return yScale(d.AnnualAnomaly - d.AnnualUnc + d.absoluteTemp);
      } else {
        return yScale(
          d[type[0].toUpperCase() + type.slice(1) + 'YearsAnomaly'] -
            d[type[0].toUpperCase() + type.slice(1) + 'YearsUnc'] +
            d.absoluteTemp
        );
      }
    })
    .defined(function (d) {
      if (type === 'annual') {
        return !isNaN(d.AnnualUnc);
      } else {
        return !isNaN(d[type[0].toUpperCase() + type.slice(1) + 'YearsUnc']);
      }
    });

  svg
    .select('.uncertainty')
    .selectAll('path')
    .data([data])
    .enter()
    .append('path')
    .attr('d', uncertinityArea);
}

// Create guid box on the graph
function createLineChartUpperBox(svg, type) {
  const upperBox = svg.append('g').attr('class', 'UpperBox');

  upperBox
    .append('rect')
    .attr('x', 10)
    .attr('width', 240)
    .attr('y', 1)
    .attr('height', 60)
    .attr('class', 'UpperBox_square')
    .attr('id', 'UpperBox-square-linechart');

  let y1RangeName = 23,
    y2RangeName = 23,
    yUncertinity = 15;
  if (type === 'annual') {
    upperBox
      .append('rect')
      .attr('x', 15)
      .attr('width', 15)
      .attr('y', yUncertinity)
      .attr('height', 16)
      .attr('class', 'uncertainty')
      .attr('id', 'range-name-unc');

    upperBox
      .append('line')
      .attr('x1', 15)
      .attr('x2', 30)
      .attr('y1', y1RangeName)
      .attr('y2', y2RangeName)
      .attr('class', 'line_chart_range_years')
      .attr('id', 'range-name-line')
      .style('stroke', 'steelblue');

    upperBox
      .append('text')
      .attr('x', 39)
      .attr('y', y2RangeName + 3)
      .attr('class', 'UpperBox')
      .attr('id', 'range-name-UpperBox')
      .html('Average Temperature with uncertainty');
  } else {
    y1RangeName = 15;
    y2RangeName = 15;
    yUncertinity = 23;
    upperBox
      .append('line')
      .attr('x1', 15)
      .attr('x2', 30)
      .attr('y1', y1RangeName)
      .attr('y2', y2RangeName)
      .attr('class', 'line_chart_range_years')
      .attr('id', 'range-name-line')
      .style('stroke', 'steelblue');

    upperBox
      .append('text')
      .attr('x', 39)
      .attr('y', y2RangeName + 3)
      .attr('class', 'UpperBox')
      .attr('id', 'range-name-UpperBox')
      .html('Avarage Annual Temperature');

    upperBox
      .append('rect')
      .attr('x', 15)
      .attr('width', 15)
      .attr('y', yUncertinity)
      .attr('height', 16)
      .attr('class', 'uncertainty')
      .attr('id', 'range-name-unc');

    y1RangeName += 16;
    y2RangeName += 16;
    upperBox
      .append('line')
      .attr('x1', 15)
      .attr('x2', 30)
      .attr('y1', y1RangeName)
      .attr('y2', y2RangeName)
      .attr('class', 'line_chart_range_years')
      .attr('id', 'range-name-line')
      .style('stroke', 'red');

    const text = `${
      type[0].toUpperCase() + type.slice(1)
    } years average tempreture with uncertainty`;
    upperBox
      .append('text')
      .attr('x', 39)
      .attr('y', y2RangeName + 3)
      .attr('class', 'UpperBox')
      .attr('id', 'range-name-UpperBox')
      .html(text);
  }

  upperBox
    .append('line')
    .attr('x1', 15)
    .attr('x2', 30)
    .attr('y1', 48)
    .attr('y2', 48)
    .attr('class', 'baselines');

  upperBox
    .append('text')
    .attr('x', 37)
    .attr('y', 50)
    .attr('class', 'UpperBox')
    .text('Baseline Temperature');

    upperBox.attr('transform', `translate(${(chartWidth-240)}, ${-60})`);
}

function updateRanges(svg, type) {
  svg.select('.UpperBox').remove();
  createLineChartUpperBox(svg, type);
}

// Draw axis on the graph
function drawAxis(svg, xClass, yClass, xScale, yScale) {
  // update  x Axis
  svg
    .selectAll('.x_axis_label')
    .attr('transform', 'translate(' + chartWidth / 2 + ', ' + labelHight + ')');

  svg.select(xClass).attr('transform', 'translate(0,' + chartHeight + ')');

  svg
    .select(xClass)
    .transition()
    .duration(500)
    .call(
      d3.axisBottom(xScale).tickFormat(d3.timeFormat('%Y')).tickSizeOuter(0)
    );

  // update  y Axis
  svg
    .selectAll('#y_axis_label_dialog')
    .style('font-size','13px')
    .attr(
      'transform',
      'translate( -50 , ' + (chartHeight / 2 + 70) + ' ) rotate(-90 0 0)'
    );

  svg
    .select(yClass)
    .transition()
    .duration(500)
    .call(d3.axisLeft(yScale).tickSizeOuter(0));
}

// Draw graph gray grid
function drawGrid(svg, xScale, yScale) {
  svg
    .select('#x_grid_linechart')
    .attr('transform', 'translate(0,' + chartHeight + ')');

  svg
    .select('#x_grid_linechart')
    .transition()
    .duration(500)
    .call(d3.axisBottom(xScale).tickSize(-chartHeight).tickFormat(''));

  svg
    .select('#y_grid_linechart')
    .transition()
    .duration(500)
    .call(d3.axisLeft(yScale).tickSize(-chartWidth).tickFormat(''));
}

// Draw Chart
function drawChart(data, type, chartId, isUpdate = false) {
  const svg = d3.select(`#${chartId}`).select('.graphics');
  if (isUpdate) {
    svg.select('.line_chart_annual').selectAll('path').remove();
    svg.select('.line_chart_range_years').selectAll('path').remove();
    svg.select('.uncertainty').selectAll('path').remove();
  }
  const scales = getScales(data, type);
  const [xScale, yScale] = scales;

  const lineGenerator = lineGenerators(xScale, yScale);
  const [
    annualLineGenerator,
    baseLineGenerator,
    fiveYearsLineGenerator,
    tenYearsLineGenerator,
    twentyYearsLineGenerator,
  ] = lineGenerator;

  drawUncertinityArea(svg, data, xScale, yScale, type);

  updateRanges(svg, type);

  const annualLine = svg
    .select('.line_chart_annual')
    .selectAll('path')
    .data([data]);
  const fiveYearsLine = svg
    .select('.line_chart_range_years')
    .selectAll('path')
    .data([data]);
  annualLine.exit().remove();
  fiveYearsLine.exit().remove();

  annualLine
    .enter()
    .append('path')
    .merge(annualLine)
    .attr('d', annualLineGenerator);

  if (type === 'five') {
    fiveYearsLine
      .enter()
      .append('path')
      .merge(fiveYearsLine)
      .attr('d', fiveYearsLineGenerator)
      .style('stroke', 'red');
  } else if (type === 'ten') {
    fiveYearsLine
      .enter()
      .append('path')
      .merge(fiveYearsLine)
      .attr('d', tenYearsLineGenerator)
      .style('stroke', 'red');
  } else if (type === 'twenty') {
    fiveYearsLine
      .enter()
      .append('path')
      .merge(fiveYearsLine)
      .attr('d', twentyYearsLineGenerator)
      .style('stroke', 'red');
  }

  const baseline = svg.select('.baselines').selectAll('path').data([data]);
  baseline.exit().remove();
  baseline.enter().append('path').merge(baseline).attr('d', baseLineGenerator);

  drawAxis(svg, '.x_axis', '.y_axis', xScale, yScale);
  drawGrid(svg, xScale, yScale);
}

// Hottest and Coldest
function putHottestColdest(data) {
  const hottestLabel = document.getElementById('hottestCountry');
  const coldestLabel = document.getElementById('coldestCountry');
  if (data) {
    const yearData = data.filter(
      d => d.Month === 6 && d.AnnualUnc <= uncThreshold
    );
    const hottestYear = yearData.sort(function (d1, d2) {
      return d2.AnnualAnomaly - d1.AnnualAnomaly;
    })[0];
    const coldestYear = yearData.sort(function (d1, d2) {
      return d1.AnnualAnomaly - d2.AnnualAnomaly;
    })[0];

    hottestLabel.innerHTML = hottestYear.Year;
    coldestLabel.innerHTML = coldestYear.Year;
  } else {
    hottestLabel.innerHTML = 'Undefined';
    coldestLabel.innerHTML = 'Undefined';
  }
}

// Read Countries Data Function
function ReadData(countryCode) {
  d3.csv(countriesPath, function (err, csv) {
    if (err) {
      console.log(err);
      throw err;
    }
    countries = csv;
    const country = countries.filter(d => d.Code === countryCode)[0];

    readCountryData(country);
  });
}

function readCountryData(country) {
  const path =
    countryFolderData + country.Code + '/' + country.Code + avgExtention;
  d3.csv(path, function (err, csv) {
    if (err) {
      console.log(err);
      throw err;
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

    countryAVG = csv;
    putHottestColdest(countryAVG);
    drawChart(countryAVG, 'annual', 'dialogCountryLinechart', true);
  });
}
