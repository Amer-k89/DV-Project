let global_chart_width,
    global_chart_height,
    global_chart_labelHeight;
// Generate Axis scales
function global_getScales(data, type) {
    const x = d3
        .scaleTime()
        .domain(
            d3.extent(data, function (d) {
                return d.date;
            })
        )
        .range([0, global_chart_width]);

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
        .range([global_chart_height, 0]);

    return [x, y];
}

// Generate Lines
function global_lineGenerators(xScale, yScale) {
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
function global_drawUncertinityArea(svg, data, xScale, yScale, type) {
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
function global_createLineChartUpperBox(svg, type) {
    const upperBox = svg.append('g').attr('class', 'UpperBox');

    upperBox
        .append('rect')
        .attr('x', 10)
        .attr('width', 290)
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

        const text = `${type[0].toUpperCase() + type.slice(1)
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

    upperBox.attr('transform', `translate(${(global_chart_width-300)/2}, ${-60})`);
}

function global_updateRanges(svg, type) {
    svg.select('.UpperBox').remove();
    global_createLineChartUpperBox(svg, type);
}

// Draw axis on the graph
function global_drawAxis(svg, xClass, yClass, xScale, yScale) {
    // update  x Axis
   /* svg
        .selectAll('.x_axis_label')
        .attr('transform', 'translate(' + global_chart_width / 2 + ', ' + global_chart_labelHeight + ')');
*/
    svg.select(xClass).attr('transform', 'translate(0,' + global_chart_height + ')');

    svg
        .select(xClass)
        .transition()
        .duration(500)
        .call(
            d3
                .axisBottom(xScale)
                .tickFormat(d3.timeFormat('%Y'))
                .ticks(6)
                .tickSizeOuter(0)
        );

    // update  y Axis
    svg
        .selectAll('.y_axis_label')
        .attr(
            'transform',
            'translate( -35 , ' + (global_chart_height / 2 + 70) + ' ) rotate(-90 0 0)'
        );

    svg
        .select(yClass)
        .transition()
        .duration(500)
        .call(d3.axisLeft(yScale).tickSizeOuter(0));
}

// Draw graph gray grid
function global_drawGrid(svg, xScale, yScale) {
    svg
        .select('#x_grid_linechart')
        .attr('transform', 'translate(0,' + global_chart_height + ')');

    svg
        .select('#x_grid_linechart')
        .transition()
        .duration(500)
        .call(d3.axisBottom(xScale).tickSize(-global_chart_height).tickFormat(''));

    svg
        .select('#y_grid_linechart')
        .transition()
        .duration(500)
        .call(d3.axisLeft(yScale).tickSize(-global_chart_width).tickFormat(''));
}

//Add and remove tooltip box on chart
function global_drawToolTipBox(
    self,
    event,
    xScale,
    data,
    tooltipLine,
    chartId,
    height,
    type
) {
    const tooltip = d3.select(`#${chartId}` + ' .tooltip');
    let pointer = d3.mouse(self.node());
    //console.log("date =  "+pointer)
    const date = xScale.invert(pointer[0]);

    const currentData = data.find(
        d => Math.abs(d.date - date) < 1000 * 60 * 60 * 24 * 16
    );
    if (currentData) {
        tooltipLine
            .attr('stroke', 'black')
            .attr('x1', xScale(date))
            .attr('x2', xScale(date))
            .attr('y1', 0)
            .attr('y2', height);

        const fieldName = type[0].toUpperCase() + type.slice(1);

        const text = String(
            "<b> <p style='text-align: center; font-size: 15px;'>" +
            currentData.Year +
            '</p>' +
            'Baseline: ' +
            currentData.absoluteTemp +
            ' &deg;C <br/>' +
            (type === 'annual'
                ? String(
                    'Annual Tempreture: ' +
                    (currentData.AnnualAnomaly + currentData.absoluteTemp).toFixed(
                        2
                    ) +
                    ' &deg;C ' +
                    ' &plusmn; ' +
                    currentData.AnnualUnc.toFixed(2) +
                    ' &deg;C '
                )
                : 'Annual Tempreture: ' +
                (currentData.AnnualAnomaly + currentData.absoluteTemp).toFixed(2) +
                ' &deg;C ' +
                ' &plusmn; ' +
                currentData.AnnualUnc.toFixed(2) +
                ' &deg;C <br/>' +
                fieldName +
                ' Years Annomaly: ' +
                (
                    currentData[fieldName + 'YearsAnomaly'] + currentData.absoluteTemp
                ).toFixed(2) +
                ' &deg;C ' +
                ' &plusmn; ' +
                currentData[fieldName + 'YearsUnc'].toFixed(2) +
                ' &deg;C ') +
            '</b>'
        );

        tooltip
            .html('')
            .style('display', 'block')
            .style('left', function () {
                let id =`tipbox-${chartId}`;
                let tipbox = document.getElementById(id).getBoundingClientRect();
                return (String(tipbox.left+pointer[0] + 10) + 'px');
            })
            .style('top', function () {
                let id =`tipbox-${chartId}`;
                let tipbox = document.getElementById(id).getBoundingClientRect();
                return (String(tipbox.top +pointer[1] + 10) + 'px');
            })
            .append('div')
            .html(text);
    }
}

function global_removeToolTipChart(tooltipLine, chartId) {
    const tooltip = d3.select(chartId + ' .tooltip');
    if (tooltip) tooltip.style('display', 'none');
    if (tooltipLine) tooltipLine.attr('stroke', 'none');
}

// Draw Chart
function draw_global_Chart(data, type, chartId, isUpdate = false) {
    let svg = d3.select(`#${chartId}`).select('.graphics');

    global_fullWidth = d3.select(`#${chartId}`).node().getBoundingClientRect().width *0.9;
    console.log("fullWidth = " + global_fullWidth);
    global_margin = { top: 0, right: 0, bottom: 0, left: 10 };
    global_chart_width = global_fullWidth - global_margin.left - global_margin.right;
    global_chart_height = (global_fullWidth * 8) / 16 - global_margin.top - global_margin.bottom ;
    global_chart_labelHeight = 235;

    svg.attr('transform', `translate(10, ${60})`);
    if (isUpdate) {
        svg.select('.line_chart_annual').selectAll('path').remove();
        svg.select('.line_chart_range_years').selectAll('path').remove();
        svg.select('.uncertainty').selectAll('path').remove();
    }
    let scales = global_getScales(data, type);
    let [xScale, yScale] = scales;

    let lineGenerator = global_lineGenerators(xScale, yScale);
    let [
        annualLineGenerator,
        baseLineGenerator,
        fiveYearsLineGenerator,
        tenYearsLineGenerator,
        twentyYearsLineGenerator,
    ] = lineGenerator;

    global_drawUncertinityArea(svg, data, xScale, yScale, type);

    global_updateRanges(svg, type);

    let annualLine = svg
        .select('.line_chart_annual')
        .selectAll('path')
        .data([data]);
        let fiveYearsLine = svg
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

    let baseline = svg.select('.baselines').selectAll('path').data([data]);
    baseline.exit().remove();
    baseline.enter().append('path').merge(baseline).attr('d', baseLineGenerator);

    let tooltipLine = d3.select(`#${chartId}-tip`);
    if (tooltipLine.empty()) {
        tooltipLine = svg
            .append('line')
            .attr('class', 'line_tip')
            .attr('id', `${chartId}-tip`);
    }

    let tooltipBox = d3.select(`#tipbox-${chartId}`);
    if (tooltipBox.empty()) {
        tooltipBox = svg
            .append('rect')
            .attr('width', global_chart_width)
            .attr('height', global_chart_height)
            .attr('opacity', 0)
            .attr('class', 'tipbox')
            .attr('id', `tipbox-${chartId}`)
            .on('mousemove', global_ToolTip_mousemove)
            .on('mouseout', () => global_removeToolTipChart(tooltipLine, `#${chartId}`));
    } else {
        tooltipBox
            .on('mousemove', global_ToolTip_mousemove)
            .on('mouseout', () => global_removeToolTipChart(tooltipLine, `#${chartId}`));
    }
    function global_ToolTip_mousemove(event) {
        global_drawToolTipBox(
            tooltipBox,
            event,
            xScale,
            data,
            tooltipLine,
            chartId,
            global_chart_height,
            type
        );
    }
    global_drawAxis(svg, '.x_axis', '.y_axis', xScale, yScale);
    global_drawGrid(svg, xScale, yScale);
}
