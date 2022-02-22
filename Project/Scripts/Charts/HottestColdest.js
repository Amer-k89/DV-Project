let currentFullWidth = fullWidth - 190;
let currentWidth = currentFullWidth - margin.left - margin.right;
let currentHight = (currentFullWidth * 9) / 16 - margin.top - margin.bottom;

///////////////////////////////////////////////////////////////////
const hottestTable = document.getElementById('temperature-Hottest-table');
const hottestSVG = d3.select('#hottestTempTable').select('#graphics');
const hottestCaption = document.getElementById('hottestCaption');

const coldestTable = document.getElementById('temperature-coldest-table');
const coldestSVG = d3.select('#coldestTempTable').select('#graphics');
const coldestCaption = document.getElementById('coldestCaption');

//Buttons
const showHottestTableButton = document.getElementById('showHottestTable');
const showHottestGraphButton = document.getElementById('showHottestGraph');

const showColdestTableButton = document.getElementById('showColdestTable');
const showColdestGraphButton = document.getElementById('showColdestGraph');

// Event listener

const getChildIndex = node =>
  Array.prototype.indexOf.call(node.parentNode.children, node);

hottestTable.addEventListener('mouseover', function (e) {
  e.preventDefault();
  const presentedData = e.target.dataset;
  if (Object.keys(presentedData).length > 0) {
    drawToolTipBoxTable(e, presentedData, '#hottestTempTable');
  }
});

hottestTable.addEventListener('mouseout', function (e) {
  e.preventDefault();
  removeToolTipChartTable('#hottestTempTable');
});

coldestTable.addEventListener('mouseover', function (e) {
  e.preventDefault();
  const presentedData = e.target.dataset;
  if (Object.keys(presentedData).length > 0) {
    drawToolTipBoxTable(e, presentedData, '#coldestTempTable');
  }
});

coldestTable.addEventListener('mouseout', function (e) {
  e.preventDefault();
  removeToolTipChartTable('#coldestTempTable');
});

showHottestTableButton.addEventListener('click', function (e) {
  e.preventDefault();
  hottestTable.classList.remove('removeDisplay');
  hottestCaption.classList.remove('removeDisplay');
  hottestSVG.attr('class', 'removeDisplay');
  const hottestBox = d3.select('#hottestTempTable').select('#hot-cold-box');
  hottestBox.attr('class', 'removeDisplay');
});

showHottestGraphButton.addEventListener('click', function (e) {
  e.preventDefault();
  hottestTable.classList.add('removeDisplay');
  hottestCaption.classList.add('removeDisplay');
  hottestSVG.attr('class', '');
  const hottestBox = d3.select('#hottestTempTable').select('#hot-cold-box');
  hottestBox.attr('class', '');
});

showColdestTableButton.addEventListener('click', function (e) {
  e.preventDefault();
  coldestTable.classList.remove('removeDisplay');
  coldestCaption.classList.remove('removeDisplay');
  coldestSVG.attr('class', 'removeDisplay');
  const coldestBox = d3.select('#coldestTempTable').select('#hot-cold-box');
  coldestBox.attr('class', 'removeDisplay');
});

showColdestGraphButton.addEventListener('click', function (e) {
  e.preventDefault();
  coldestTable.classList.add('removeDisplay');
  coldestCaption.classList.add('removeDisplay');
  coldestSVG.attr('class', '');
  const coldestBox = d3.select('#coldestTempTable').select('#hot-cold-box');
  coldestBox.attr('class', '');
});

// Draw ToolTip

function drawToolTipBoxTable(e, data, chartId) {
  const tooltip = d3.select(chartId + ' .tooltip');

  const text = String(
    "<b> <p style='text-align: center; font-size: 15px;'>" +
      data.year +
      '</p>' +
      data.temp +
      ' &deg;C ' +
      ' &plusmn; ' +
      data.unc +
      ' &deg;C'
  );

  tooltip
    .html('')
    .style('display', 'block')
    .style('left', String(e.pageX + 20) + 'px')
    .style('top', String(e.pageY - 20) + 'px')
    .append('div')
    .html(text);
}

function removeToolTipChartTable(chartId) {
  const tooltip = d3.select(chartId + ' .tooltip');
  if (tooltip) tooltip.style('display', 'none');
}

//Handel Data

function addTransMonthData(transformedData, monthArray, month) {
  for (let index = 0; index < 10; index++) {
    const transDataObj = transformedData.find(d => d.rank === index + 1);
    if (transDataObj) {
      const monObj = {
        year: monthArray[index].Year,
        month: monthArray[index].Month,
        Temp: +monthArray[index].MonthlyAnomaly.toFixed(2),
        TempUnc: +monthArray[index].MonthlyUnc.toFixed(2),
        baseline: +monthlyAbsoluteData[0][getMonthName(month)],
      };
      transDataObj.monthes.push(monObj);
    } else {
      const dataObj = {
        rank: index + 1,
        monthes: [
          {
            year: monthArray[index].Year,
            month: monthArray[index].Month,
            Temp: +monthArray[index].MonthlyAnomaly.toFixed(2),
            TempUnc: +monthArray[index].MonthlyUnc.toFixed(2),
            baseline: +monthlyAbsoluteData[0][getMonthName(month)],
          },
        ],
        annual: {},
      };
      transformedData.push(dataObj);
    }
  }
}

function addTransYearData(transformedData, yearData) {
  for (let index = 0; index < 10; index++) {
    const transDataObj = transformedData.find(d => d.rank === index + 1);
    if (transDataObj) {
      const yearObj = {
        year: yearData[index].Year,
        Temp: +yearData[index].AnnualAnomaly.toFixed(2),
        TempUnc: +yearData[index].AnnualUnc.toFixed(2),
        baseline: +yearData[index].absoluteTemp.toFixed(2),
      };
      transDataObj.annual = yearObj;
    }
  }
}

function arrangeData(data, type) {
  const transformedData = [];
  for (let month = 1; month <= 12; month++) {
    const monthData = data
      .filter(d => d.Month === month && d.MonthlyUnc <= uncThreshold)
      .sort(function (d1, d2) {
        if (type === 'hot') {
          return d2.MonthlyAnomaly - d1.MonthlyAnomaly;
        } else {
          return d1.MonthlyAnomaly - d2.MonthlyAnomaly;
        }
      })
      .slice(0, 10);
    addTransMonthData(transformedData, monthData, month);
  }
  const yearData = data
    .filter(d => d.Month === 6 && d.AnnualUnc <= uncThreshold)
    .sort(function (d1, d2) {
      if (type === 'hot') {
        return d2.AnnualAnomaly - d1.AnnualAnomaly;
      } else {
        return d1.AnnualAnomaly - d2.AnnualAnomaly;
      }
    })
    .slice(0, 10);
  addTransYearData(transformedData, yearData);
  fillTable(transformedData, type);
}

function getChartData(data, type) {
  const years = data
    .filter(d => d.Month === 6 && d.AnnualUnc <= uncThreshold)
    .sort(function (d1, d2) {
      if (type === 'hot') {
        return d2.AnnualAnomaly - d1.AnnualAnomaly;
      } else {
        return d1.AnnualAnomaly - d2.AnnualAnomaly;
      }
    })
    .slice(0, 10)
    .map(d => d.Year);

  let retYears = [];
  for (let counter = 0; counter < years.length; counter++) {
    const currentYearData = data.filter(d => d.Year === years[counter]);
    retYears = [...retYears, ...currentYearData];
  }

  return [years, retYears];
}

// Add row function

function addHeader(table) {
  let htmlText = '<thead>';
  htmlText += '<tr>';
  htmlText += '<th>Rank</th>';
  for (let i = 1; i <= 12; i++) {
    htmlText += `<th>${getMonthName(i)}</th>`;
  }
  htmlText += '<th>Annual</th>';
  htmlText += '</tr>';
  htmlText += '</thead>';
  table.insertAdjacentHTML('beforeend', htmlText);
}

function generateRowString(rankObj) {
  const backgroundClass = `class="rank-recent-year"`;
  let htmlText = `<tr>`;
  htmlText += `<td>${rankObj.rank}</td>`;
  for (let index = 0; index < rankObj.monthes.length; index++) {
    const monthData = rankObj.monthes[index];
    htmlText += `<td${
      monthData.year >= 2000 ? ' ' + backgroundClass : ''
    } data-year=${monthData.year} data-temp=${(
      monthData.Temp + monthData.baseline
    ).toFixed(2)} data-unc=${monthData.TempUnc}>${monthData.year}</td>`;
  }
  htmlText += `<td${
    rankObj.annual.year >= 2000 ? ' ' + backgroundClass : ''
  } data-year=${rankObj.annual.year} data-temp=${(
    rankObj.annual.Temp + rankObj.annual.baseline
  ).toFixed(2)} data-unc=${rankObj.annual.TempUnc}>${rankObj.annual.year}</td>`;
  htmlText += '</tr>';
  return htmlText;
}

function fillTable(data, type) {
  let htmlText = '';
  for (let index = 0; index < data.length; index++) {
    const currentRankObj = data[index];
    htmlText += generateRowString(currentRankObj);
  }
  if (type === 'hot') {
    hottestTable.insertAdjacentHTML('beforeend', htmlText);
  } else {
    coldestTable.insertAdjacentHTML('beforeend', htmlText);
  }
}

// Scales generator
function generateScalesHottestColdest(data) {
  const monthes = [];
  MONTHES.forEach(m => monthes.push(parseMonth(m)));

  const xScale = d3
    .scaleTime()
    .domain(
      d3.extent(monthes, function (m) {
        return m;
      })
    )
    .range([0, currentWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data, function (d) {
        return d.AnnualAnomaly - d.AnnualUnc - 0.5;
      }),
      d3.max(data, function (d) {
        return d.AnnualAnomaly + d.AnnualUnc + 0.5;
      }),
    ])
    .range([currentHight, 0]);

  return [xScale, yScale];
}

// Line generator function

function lineGeneratorHottestColdest(xScale, yScale) {
  const line = d3
    .line()
    .x(function (d) {
      return xScale(parseMonth(d.Month));
    })
    .y(function (d) {
      return yScale(d.AnnualAnomaly);
    })
    .defined(d => {
      return !isNaN(d.AnnualAnomaly);
    });

  return line;
}

// color generator

function getStyle(d, index, type) {
  const colorScale =
    type === 'hot'
      ? d3.scaleLinear().domain([1, 100]).range(['red', 'blue'])
      : d3.scaleLinear().domain([1, 100]).range(['blue', 'red']);

  const style =
    'stroke:' +
    colorScale(index * 10) +
    ';' +
    'fill: none;' +
    'stroke-width: 2px;' +
    'stroke-opacity:80%;';

  return style;
}

function getColor(index, type) {
  const colorScale =
    type === 'hot'
      ? d3.scaleLinear().domain([1, 100]).range(['red', 'blue'])
      : d3.scaleLinear().domain([1, 100]).range(['blue', 'red']);

  return colorScale(index * 10);
}

// text box

function createTextBoxFor(containerId, years, type) {
  const container = d3.select(`#${containerId}`);

  const box = container
    .append('svg')
    .attr('class', 'removeDisplay')
    .attr('id', 'hot-cold-box')
    .attr('width', 220)
    .attr('height', 350);

  let curX = 50,
    curY = 25;

  box
    .append('rect')
    .attr('x', curX - 20)
    .attr('y', curY);

  const boxTitle =
    type === 'hot' ? 'Top 10 Hottest Anomalies' : 'Top 10 Coldest Anomalies';

  box
    .append('text')
    .attr('x', curX - 30)
    .attr('y', curY)
    .attr('class', 'title-box')
    .text(boxTitle);
  for (let yearIndex = 0; yearIndex < years.length; yearIndex++) {
    const currentyear = years[yearIndex];
    // const yearData = data.filter(d => d.Year === currentyear);
    curY += 30;

    box
      .append('rect')
      .attr('x', curX)
      .attr('width', 20)
      .attr('y', curY - 10)
      .attr('height', 20)
      .attr('fill', getColor(yearIndex, type));

    // text-box

    box
      .append('text')
      .attr('class', 'text-box')
      .attr('x', curX + 35)
      .attr('y', curY + 5)
      .attr('id', `${type}-text-${yearIndex}`)
      .html(currentyear)
      .on('mouseover', function (e) {
        boxMouseOver(this, e);
      })
      .on('mouseout', function (e) {
        boxMouseOut(this, e);
      });
  }
}

// Mouse functions

function boxMouseOver(self, e) {
  e.preventDefault();
  d3.select(self)
    .style('font-weight', 'bold')
    .style('text-decoration', 'underline')
    .style('text-decoration-color', 'black');

  const year = self.innerHTML;
  d3.select(`#path_${year}`).style('stroke-width', '6px');
}

function boxMouseOut(self, e) {
  e.preventDefault();
  d3.select(self)
    .style('font-weight', 'normal')
    .style('text-decoration', 'none');

  const year = self.innerHTML;
  d3.select(`#path_${year}`).style('stroke-width', '2px');
}

function svgMouseOver(self, e) {
  const className = e.path[1].className['baseVal'];
  const [lineType, index] = className.split('_');

  d3.select(self).style('stroke-width', '6px');
  console.log(self);
  d3.select(`#${lineType}-text-${index}`)
    .style('font-weight', 'bold')
    .style('text-decoration', 'underline')
    .style('text-decoration-color', 'black');
}

function svgMouseOut(self, e) {
  const className = e.path[1].className['baseVal'];
  const [lineType, index] = className.split('_');

  d3.select(self).style('stroke-width', '2px');
  console.log(self);
  d3.select(`#${lineType}-text-${index}`)
    .style('font-weight', 'normal')
    .style('text-decoration', 'none');
}

//Update Chart data
function updateChart(data, svg, type) {
  const [years, presentedData] = getChartData(data, type);

  const [xScale, yScale] = generateScalesHottestColdest(presentedData);

  const generator = lineGeneratorHottestColdest(xScale, yScale);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b'));
  const yAxis = d3.axisLeft(yScale);

  svg
    .attr('width', currentWidth + margin.left + margin.right)
    .attr('height', currentHight + margin.top + margin.bottom)
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  //Draw Axis
  svg
    .selectAll('.x_axis_label')
    .attr('transform', 'translate(' + currentWidth / 2 + ', 365)');

  svg
    .select('g.x_axis')
    .attr('transform', 'translate(0,' + currentHight + ')')
    .call(xAxis);

  svg
    .selectAll('.y_axis_label')
    .attr(
      'transform',
      'translate( -50 , ' + (currentHight / 2 + 60) + ' ) rotate(-90 0 0)'
    );

  svg.select('g.y_axis').call(yAxis);

  type === 'hot'
    ? createTextBoxFor('hottestTempTable', years, type)
    : createTextBoxFor('coldestTempTable', years, type);

  for (let yearIndex = 0; yearIndex < years.length; yearIndex++) {
    const currentyear = years[yearIndex];
    const yearData = presentedData.filter(d => d.Year === currentyear);

    svg
      .select('g')
      .append('g')
      .attr('class', `${type}_${yearIndex}`)
      .selectAll('path')
      .data([yearData])
      .enter()
      .append('path')
      .attr('id', `path_${currentyear}`)
      .attr('d', generator)
      .attr('style', d => getStyle(d, yearIndex, type))
      .on('mouseover', function (e) {
        svgMouseOver(this, e);
      })
      .on('mouseout', function (e) {
        svgMouseOut(this, e);
      });
  }
}

//Initiator function
function initTables(coutriesAVG) {
  addHeader(hottestTable);
  addHeader(coldestTable);
  arrangeData(coutriesAVG, 'hot');
  arrangeData(coutriesAVG, 'cold');
  updateChart(coutriesAVG, hottestSVG, 'hot');
  updateChart(coutriesAVG, coldestSVG, 'cold');
}
