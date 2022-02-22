
var currentValue = 0;
var play_slider = new Object();
play_slider.play_status = false;
play_slider.view = "main";
var timer;
var step;
function reset_slider() {
    currentValue = 0;
    fileName = undefined;
    pause();
}

function pause() {
    play_slider.play_status = false;
    d3.select("#start_img")
        .attr('src', 'Images/play.png');
    clearInterval(timer);
    timer = undefined;
}
function play() {
    play_slider.play_status = true;
    d3.select("#start_img")
        .attr('src', 'Images/pause.png');
    timer = setInterval(step, selected_play_speed);
}
function update_timer() {
    clearInterval(timer);
    timer = undefined;
    if (play_slider.play_status) {
        timer = setInterval(step, selected_play_speed);
    }
}

function create_year_slider(data) {
    var formatDateIntoYear = d3.timeFormat("%Y");
    var formatDate = d3.timeFormat("%b %Y");

    var slider_div = d3.select("div#year_slider");
    slider_div.selectAll("*").remove();
    var margin = { top: 0, right: 70, bottom: 0, left: 70 },
        width = slider_div.node().getBoundingClientRect().width - margin.left - margin.right;
    height = 70 - margin.top - margin.bottom;

    slider_div.append("a")
        .attr("id", "slider_but")
        .attr("class", "start_button")
        .append('img')
        .attr('src', 'Images/play.png')
        .attr('height', '50px')
        .attr("width", '50px')
        .attr("id", "start_img")
        .style('pointer-events', 'none')
        .attr('alt', 'Start');
    d3.select("#slider_but")
        .on("click", function (d) {
            play_slider.play_status = !play_slider.play_status
            if (play_slider.play_status) {
                play();
            } else {
                pause();
            }

        });
    var x = d3.scaleTime()
        .domain([data[0], data[1]])
        .range([0, width])
        .clamp(true);

    var svg = d3.select("div#year_slider")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr('height', height);

    var slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function () { slider.interrupt(); })
            .on("start drag", function () {
                currentValue = d3.event.x;
                hue(x.invert(currentValue));
                if (timer) {
                    clearInterval(timer);
                    timer = undefined;
                }
            })
            .on("end", function () {
                update_map(x.invert(d3.event.x));
                if (play_slider.play_status)
                    timer = setInterval(step, selected_play_speed);
            }));

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(10))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function (d) { return formatDateIntoYear(d); });

    var label = slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(function () {
            if (selected_data_type == "Anomaly") {
                return formatDateIntoYear(data[0])
            }
            else {
                return formatDate(data[0])
            }

        })
        .attr("transform", "translate(0," + (-15) + ")")

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);
    set_slider();
    function hue(h) {
        handle.attr("cx", x(h));
        label
            .attr("x", x(h))
            .text(function () {
                if (selected_data_type == "Anomaly") {
                    return formatDateIntoYear(h)
                }
                else {
                    return formatDate(h)
                }
            });
        //svg.style("background-color", d3.hsl(h / 1000000000, 0.8, 0.8));
        //update_map(h);
    }
    step = function () {
        if (currentValue < 0) currentValue = 0;
        if (selected_data_type == "Anomaly") {
            currentValue = currentValue + (width / statistics_data.Anomaly_year_count);
        }
        else {
            currentValue = currentValue + (width / statistics_data.EA_months_count);
        }

        console.log("Slider  currentValue: " + currentValue);
        if (currentValue > width) {
            play_slider.play_status = false;
            currentValue = 0;
            clearInterval(timer);
            d3.select("#start_img")
                .attr('src', 'Images/play.png');
        }
        else {
            hue(x.invert(currentValue));
            update_map(x.invert(currentValue));
        }
    }
    function set_slider() {
        console.log("set_slider  currentValue: " + currentValue);
        if (play_slider.view == selected_view) {
            hue(x.invert(currentValue));
        }
        else {
            reset_slider();
            hue(x.invert(currentValue));
        }
        update_map(x.invert(currentValue));
        play_slider.view = selected_view;
    }

    function update_map(date) {
        var start_year = new Date(date).getFullYear();
        var start_month = new Date(date).getMonth() + 1;
        var file = Number(start_year + (start_month - 0.5) / 12).toFixed(3);
        var mapsvg = d3.select("#map_svg");
        map = mapsvg.select("#map");
        let earth = d3.select("#earth")
        if (selected_data_type == "Anomaly") {
            fileName = "Data/Years/" + start_year + "/" + selected_temperature_measure + "_" + selected_data_year + "Anomaly.csv"
        }
        else {
            fileName = 'Data/CSVs/' + file + '.csv'; //
        }

        mapData = [];
        d3.csv(fileName, function (error, csv) {
            if (error) {
                console.log(error);  //Log the error.
                map.selectAll(".countries")
                    .style("fill", "rgb(128,128,128)");
                map.selectAll('.map_background')
                    .attr('fill', 'azure')
                throw error;
            }
            if (selected_data_type == "Anomaly") {
                csv.forEach(function (d) {
                    k = Object.keys(d);
                    v = Object.values(d);
                    let obj = new Object();
                    obj.country_id = Number(v[1])
                    obj.alpha3_code = v[2]
                    obj.temp = v[3];
                    if (obj.temp)
                        obj.temp_color = sequentialScale(obj.temp);
                    else
                        obj.temp_color = "rgb(128,128,128)";
                    mapData.push(obj);
                });
                map.selectAll(".countries")
                    .style("opacity", "0.9")
                    .transition()
                    .duration(selected_play_speed)
                    .style("fill", function (d) {
                        country = mapData.find(element => element.country_id == d.id);
                        if (country === undefined)
                            return "rgb(128,128,128)";
                        else {
                            return country.temp_color;
                        }
                    });
                if (selected_view == "3D_Map") {
                    render();
                }
            }
            else {
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
                map.selectAll(".countries")
                    .style("opacity", "0.4")
                earth.selectAll(".points")
                    .style("opacity", "1")
                    .data(mapData)
                    .transition()
                    .duration(selected_play_speed)
                    .style("fill", function (d) { return d.temp_color });

            }
        });
    }

}