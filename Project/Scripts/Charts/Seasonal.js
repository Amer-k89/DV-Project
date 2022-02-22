//Helper functions

function getColorSeasonal(d, data) {
  const lastYears = [];

  for (let i = 0; i < data.length; i++) {
    lastYears.push(data[i][0].Year);
  }

  for (let i = 0; i < colors.length; i++) {
    if (data[i][0].Year == d[0].Year) {
      return colors[i];
    }
  }
}

//Handel Data
function handelSeasonalData(coutriesData, monthlyAbsoluteData) {
  const chartData = [];

  for (let counter = 1; counter <= 12; counter++) {
    const monthData = {};
    monthData.month = counter;

    let filteredData = coutriesData.filter(
      cd => cd.Month === counter && cd.Year >= 1951 && cd.Year <= 1980
    );

    monthData.seasonalData =
      monthlyAbsoluteData.seasonalData[getMonthName(counter)];

    monthData.unc = +(1.96 * d3.deviation(filteredData, e => e.MonthlyAnomaly));

    filteredData = coutriesData.filter(
      e => e.Month == counter && e.MonthlyUnc < 1
    );

    monthData.max = d3.max(filteredData, e => e.MonthlyAnomaly);
    monthData.min = d3.min(filteredData, e => e.MonthlyAnomaly);

    chartData.push(monthData);
  }

  return chartData;
}

function handelLastYearsData(coutriesData, monthlyAbsoluteData) {
  const lastYear = d3.max(coutriesData, function (d) {
    return d.Year;
  });
  const lastYearData = [];
  for (let year = lastYear - 2; year <= lastYear; year++) {
    const yearData = coutriesData.filter(d => d.Year === year);

    const manipulatedYearData = yearData.map(function (d) {
      console.log(d);
      return {
        Year: d.Year,
        Month: d.Month,
        monthlyTemp:
          d.MonthlyAnomaly +
          monthlyAbsoluteData.seasonalData[getMonthName(d.Month)],
      };
    });

    lastYearData.push(manipulatedYearData);
  }

  return lastYearData;
}

// Scales Generators

function generateScales(coutriesData, monthlyAbsoluteData) {
  const monthes = [];
  MONTHES.forEach(m => monthes.push(parseMonth(m)));

  const xScale = d3
    .scaleTime()
    .domain(
      d3.extent(monthes, function (m) {
        return m;
      })
    )
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(coutriesData, function (d) {
        return (
          d.MonthlyAnomaly +
          monthlyAbsoluteData.seasonalData[getMonthName(d.Month)]
        );
      }) - 6,
      d3.max(coutriesData, function (d) {
        return (
          d.MonthlyAnomaly +
          monthlyAbsoluteData.seasonalData[getMonthName(d.Month)]
        );
      }) + 10,
    ])
    .range([height, 0]);

  return [xScale, yScale];
}

// Line Generator

function lineGenerator(xScale, yScale) {
  const uncAreaGenerator = d3
    .area()
    .x(function (d) {
      return xScale(parseMonth(d.month));
    })
    .y0(function (d) {
      return yScale(d.seasonalData + d.unc);
    })
    .y1(function (d) {
      return yScale(d.seasonalData - d.unc);
    });

  const baseLineGenerator = d3
    .line()
    .x(function (d) {
      return xScale(parseMonth(d.month));
    })
    .y(function (d) {
      return yScale(d.seasonalData);
    });

  const maxLineGenerator = d3
    .line()
    .x(function (d) {
      return xScale(parseMonth(d.month));
    })
    .y(function (d) {
      return yScale(d.seasonalData + d.max);
    });

  const minLineGenerator = d3
    .line()
    .x(function (d) {
      return xScale(parseMonth(d.month));
    })
    .y(function (d) {
      return yScale(d.seasonalData + d.min);
    });

  const lastYearsLinesGenerator = d3
    .line()
    .x(function (d) {
      return xScale(parseMonth(d.Month));
    })
    .y(function (d) {
      return yScale(d.monthlyTemp);
    })
    .defined(d => {
      return !isNaN(d.monthlyTemp);
    });

  return [
    uncAreaGenerator,
    baseLineGenerator,
    maxLineGenerator,
    minLineGenerator,
    lastYearsLinesGenerator,
  ];
}

// create uppper box

function createUpperBox(svg, lastYearData) {
  svg.select('.UpperBox').remove();
  const upperBox = svg.append('g').attr('class', 'UpperBox');
  let curY = 15;

  upperBox
    .append('rect')
    .attr('x', 10)
    .attr('width', 250)
    .attr('y', 1)
    .attr('height', 100)
    .attr('class', 'UpperBox_square')
    .attr('id', 'UpperBox-square-seasonal');

  for (let i = lastYearData.length - 1; i >= 0; i--) {
    upperBox
      .append('line')
      .attr('x1', 15)
      .attr('x2', 30)
      .attr('y1', curY)
      .attr('y2', curY)
      .attr('stroke', colors[i]);

    upperBox
      .append('text')
      .attr('x', 40)
      .attr('y', curY + 3)
      .attr('class', 'UpperBox')
      .html(lastYearData[i][0].Year + ' Monthly Tempreture')
      .attr('id', 'legend-text-' + i);

    curY += 15;
  }
  curY -= 3;

  upperBox
    .append('rect')
    .attr('x', 15)
    .attr('width', 15)
    .attr('y', curY)
    .attr('height', 16)
    .attr('class', 'uncertainty');

  upperBox
    .append('line')
    .attr('x1', 15)
    .attr('x2', 30)
    .attr('y1', curY + 8)
    .attr('y2', curY + 8)
    .attr('class', 'baseLineUnc');

  upperBox
    .append('text')
    .attr('x', 40)
    .attr('y', curY + 11)
    .attr('class', 'UpperBox')
    .html('1951-1980 average with uncertainty');

  curY += 30;
  upperBox
    .append('line')
    .attr('x1', 15)
    .attr('x2', 39)
    .attr('y1', curY)
    .attr('y2', curY)
    .attr('class', 'rangeLineSeasonal');

  upperBox
    .append('text')
    .attr('x', 40)
    .attr('y', curY + 3)
    .attr('class', 'UpperBox')
    .attr('id', 'range-name-UpperBox')
    .html(
      'Min-Max Range Temp. Untill ' +
        lastYearData[lastYearData.length - 1][0].Year
    );

  upperBox.attr('transform', `translate(${seasonalBoxX}, ${seasonalBoxY})`);
}

// Tool Tip functions

function drawToolTipBoxSeasonal(
  tooltipBox,
  e,
  xScale,
  seasonalData,
  lastYearsData,
  tooltipLine
) {
  const tooltip = d3.select('#tooltip-seasonal-changes');

  const date = xScale.invert(d3.pointer(e, tooltipBox.node())[0]);

  const currentData = seasonalData.find(
    d =>
      (d.month - 1 == date.getMonth() + 1 && date.getDate() >= 15) ||
      (d.month - 1 == date.getMonth() && date.getDate() < 15) ||
      (date.getDate() >= 15 && date.getMonth() == 11 && d.month == 1)
  );

  tooltipLine
    .attr('stroke', 'black')
    .attr('x1', xScale(parseMonth(currentData.month)))
    .attr('x2', xScale(parseMonth(currentData.month)))
    .attr('y1', 0)
    .attr('y2', height);

  let text =
    "<p id='text-tip-seasonal'>" +
    getFullMonthName(currentData.month) +
    '</p>' +
    'Average (1951-1980): ' +
    String(currentData.seasonalData.toFixed(1)) +
    ' &deg;C' +
    '<br/>Min-Max Temp Range: ' +
    '[ ' +
    String((currentData.seasonalData - currentData.unc).toFixed(2)) +
    ' &deg;C  -  ' +
    String((currentData.seasonalData + currentData.unc).toFixed(2)) +
    ' &deg;C  ]';

  for (let i = lastYearsData.length - 1; i >= 0; i--) {
    const row = lastYearsData[i].filter(d => d.Month == currentData.month)[0];

    if (row != undefined)
      text +=
        '<br/>' + row.Year + ': ' + row.monthlyTemp.toFixed(2) + ' &deg;C';
    else text += '<br/>' + lastYearsData[i][0].Year + ': NaN';
  }

  tooltip
    .html('')
    .style('display', 'block')
    .style('left', String(e.pageX + 20) + 'px')
    .style('top', String(e.pageY - 20) + 'px')
    .append('div')
    .html(text);
}

function removeTooltipSeasonal(tooltipLine) {
  const tooltip = d3.select('#tooltip-seasonal-changes');
  if (tooltip) tooltip.style('display', 'none');
  if (tooltipLine) tooltipLine.attr('stroke', 'none');
}

//Present Chart

function showChart(countryAVGData, monthlyAbsoluteData, chartId) {
  const seasonalData = handelSeasonalData(countryAVGData, monthlyAbsoluteData);
  const lastYearsData = handelLastYearsData(
    countryAVGData,
    monthlyAbsoluteData
  );

  const scales = generateScales(countryAVGData, monthlyAbsoluteData);
  const [xScale, yScale] = scales;

  const generators = lineGenerator(xScale, yScale);
  const [
    uncAreaGenerator,
    baseLineGenerator,
    maxLineGenerator,
    minLineGenerator,
    lastYearsLinesGenerator,
  ] = generators;

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b'));
  const yAxis = d3.axisLeft(yScale);

  const svg = d3
    .select(`#${chartId}`)
    .select('svg')
    .attr('class', 'graphics')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .select('g.chart')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  //Draw Axis
  d3.selectAll('.x_axis_label').attr(
    'transform',
    'translate(' + width / 2 + ', ' + labelHight + ')'
  );

  svg
    .select('g.x_axis_seasonal')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  svg.select('g.y_axis_seasonal').call(yAxis);

  d3.selectAll('.y_axis_label').attr(
    'transform',
    'translate( -50 , ' + (height / 2 + 60) + ' ) rotate(-90 0 0)'
  );

  //Draw Grid
  svg
    .select('#x_grid_seasonal')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale).tickSize(-height).tickFormat(''));

  svg
    .select('#y_grid_seasonal')
    .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(''));

  //Draw Charts
  const uncArea = svg
    .select('#seasonalBaselineUnc')
    .selectAll('path')
    .data([seasonalData]);
  uncArea.exit().remove();
  uncArea.enter().append('path').merge(uncArea).attr('d', uncAreaGenerator);

  const seasonalBaseline = svg
    .select('#seasonalBaseline')
    .selectAll('path')
    .data([seasonalData]);
  seasonalBaseline.exit().remove();
  seasonalBaseline
    .enter()
    .append('path')
    .merge(seasonalBaseline)
    .attr('d', baseLineGenerator);

  const rangeLineMax = svg
    .select('#rangeLineMax')
    .selectAll('path')
    .data([seasonalData]);
  rangeLineMax.exit().remove();
  rangeLineMax
    .enter()
    .append('path')
    .merge(rangeLineMax)
    .attr('d', maxLineGenerator);

  const rangeLineMin = svg
    .select('#rangeLineMin')
    .selectAll('path')
    .data([seasonalData]);
  rangeLineMin.exit().remove();
  rangeLineMin
    .enter()
    .append('path')
    .merge(rangeLineMin)
    .attr('d', minLineGenerator);

  const lastYearLine = svg
    .select('.lastYearLine')
    .selectAll('path')
    .data(lastYearsData);

  lastYearLine.exit().remove();

  svg
    .select('.lastYearLine')
    .selectAll('path')
    .data(lastYearsData)
    .enter()
    .append('path')
    .attr('id', d => d[0].Year)
    .attr('stroke', d => getColorSeasonal(d, lastYearsData))
    .attr('d', lastYearsLinesGenerator);

  createUpperBox(svg, lastYearsData);

  let tooltipLine = d3.select(`#${chartId}`).select('#seasonal_tip_line');
  if (tooltipLine.empty()) {
    tooltipLine = svg
      .append('line')
      .attr('class', 'line_tip')
      .attr('id', 'seasonal_tip_line');
  }

  let tooltipBox = d3.select(`#${chartId}`).select('#tipbox-seasonal');
  if (tooltipBox.empty()) {
    tooltipBox = svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('opacity', 0)
      .attr('class', 'tipbox')
      .attr('id', 'tipbox-seasonal')
      .on('mousemove', e => {
        drawToolTipBoxSeasonal(
          tooltipBox,
          e,
          xScale,
          seasonalData,
          lastYearsData,
          tooltipLine
        );
      })
      .on('mouseout', () => removeTooltipSeasonal(tooltipLine));
  } else {
    tooltipBox.on('mousemove', e => {
      drawToolTipBoxSeasonal(
        tooltipBox,
        e,
        xScale,
        seasonalData,
        lastYearsData,
        tooltipLine
      );
    });
  }
}
