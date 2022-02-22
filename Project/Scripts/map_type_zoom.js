main();
view_3d = false;
function main() {
    console.log("  maiiiiiin ");
    //draw_map("3D_Map");

    map_type_zoom_div = d3.select("div#map_type_zoom");
    map_type_zoom_div.selectAll("*").remove();
    map_type_zoom_div.attr('align', 'center');

    map_type_zoom_div.append("a")
        .attr("id", "map_zoom_in_but")
        .attr('height', '50px')
        .attr("width", '50px')

    d3.select("#map_zoom_in_but")
        .append('img')
        .attr("id", "map_zoom_in_img")
        .attr('src', 'Images/zoom_in.png')
        .attr('height', '50px')
        .attr("width", '50px')
        .style('cursor', 'zoom-in')
        //.attr('alt', '2D')
        .on("click", function (d) {
            if (selected_view == "3D_Map") {
                _3d_zoom(-125);
            } else {
                zoom(-125);
            }

        });


    map_type_zoom_div.append("a")
        .attr("id", "map_zoom_out_but")
        .attr('height', '50px')
        .attr("width", '50px')

    d3.select("#map_zoom_out_but")
        .append('img')
        .attr("id", "map_zoom_out_img")
        .attr('src', 'Images/zoom_out.png')
        .attr('height', '50px')
        .attr("width", '50px')
        .style('cursor', 'zoom-out')
        //.attr('alt', '2D')
        .on("click", function (d) {
            if (selected_view == "3D_Map") {
                _3d_zoom(125);
            } else {
                zoom(125);
            }

        });
        map_type_zoom_div.append("a")
        .attr("id", "map_zoom_reset_but")
        .attr('height', '50px')
        .attr("width", '50px')

    d3.select("#map_zoom_reset_but")
        .append('img')
        .attr("id", "map_zoom_reset_img")
        .attr('src', 'Images/zoom_reset.png')
        .attr('height', '50px')
        .attr("width", '50px')
        .style('margin-bottom', '10px')
        .style('margin-bottom', '30px')
        .style('cursor', 'pointer')
        //.attr('alt', '2D')
        .on("click", function (d) {
            if (selected_view == "3D_Map") {
                _3d_zoom_reset();
            } else {
                zoom_reset();
            }

        });




    var label = map_type_zoom_div.append("text")
        .attr("class", "map_type_text")
        .attr("text-anchor", "middle")
        .text("3D");
    //.attr("transform", "translate(0," + (-15) + ")")
    map_type_zoom_div.append("a")
        .attr("id", "map_type_but")
        .attr('height', '50px')
        .attr("width", '50px')

    d3.select("#map_type_but")
        .append('img')
        .attr("id", "map_type_img")
        .attr('src', 'Images/3d_map.png')
        .attr('height', '50px')
        .attr("width", '50px')
        .style('cursor', 'pointer')
        //.attr('alt', '2D')
        .on("click", function (d) {
            view_3d = !view_3d;
            if (view_3d) {
                $("#data_type_Country").prop("checked", true);
                d3.select("#data_type_Country").dispatch("change");
                /* d3.select("#data_type_Country")
                 .attr('checked', true);*/
                d3.select("#map_type_img")
                    .attr('src', 'Images/2d_map.png');
                label.text("2D");
                selected_view = "3D_Map";
                reset_slider();
                update();
            } else {

                d3.select("#map_type_img")
                    .attr('src', 'Images/3d_map.png');
                label.text("3D");
                selected_view = "main";
                reset_slider();
                update();
            }

        });

}
function _3d_zoom_reset()
{
    _3D_projection.scale((450 - 10) / 2)
    .translate([600 / 2, 450 / 2])
    render();
}
function zoom_reset()
{
    var mapsvg = d3.select('#map_svg');
    let W = mapsvg.node().getBoundingClientRect().width;
    let H = mapsvg.node().getBoundingClientRect().height;

    projection = d3
      .geoNaturalEarth1()
      .scale(150)
      .translate([W / 2, H / 2]);

      path = d3.geoPath().projection(projection);
      graticule = d3.geoGraticule10();
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
                      return 4 * 1;
                  case lat <= 70:
                      return 6 * 1;
                  case lat <= 84:
                      return 7 * 1;
                  case lat > 84:
                      return 2 * 1;
                  default:
                      return 5 * 1;
              }
          })
}
function zoom(in_out) {
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

    var newScale = currScale - zoom_f * in_out;
    var currTranslate = projection.translate();
    var coords = projection.invert([event.offsetX, event.offsetY]);

    console.log("currScale  :  " + currScale);
    console.log("newScale  :  " + newScale);
    console.log("currTranslate  :  " + currTranslate);
    console.log("coords  :  " + coords);

    mapsvg = d3.select('#map_svg');
    if (newScale > 50 && newScale < 5500) {
        projection.scale(newScale);
        var newPos = projection(coords);

        // projection.translate([currTranslate[0] + (event.offsetX - newPos[0]), currTranslate[1] + (event.offsetY - newPos[1])]);
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

}

function _3d_zoom(in_out) {

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
    var newScale = currScale - zoom_f *in_out;
    if (newScale > 50 && newScale < 5500) {
        _3D_projection.scale(newScale);
        render();
    }
}