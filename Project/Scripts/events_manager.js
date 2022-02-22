
main();
function main() {
    console.log(" Events Manager Started ");
    change_data_type("country_data_year", false);
    change_data_type("country_data_measure", false);
    d3.select('#data_type_equal_erea')
        .on('change', function () {
            selected_data_type = "equal_erea";
            console.log(" Data Type  = " + this.value);
            change_data_type("country_data_year", false);
            change_data_type("country_data_measure", false);
            d3.select("#type_info_tooltiptext")
                .html("Equal Erea Tempreture : is a grided dataset based on dividing the Earth into 15984 equal-area grid cells with the avareged temperature");
            selected_view = "main";
            d3.select("#map_type_img")
                .attr('src', 'Images/3d_map.png');
            d3.select(".map_type_text").text("3D");
            reset_slider();
            update();
        });
    d3.select('#data_type_Country')
        .on('change', function () {
            selected_data_type = "Anomaly";
            console.log(" Data Type  = " + this.value);
            change_data_type("country_data_year", true);
            change_data_type("country_data_measure", true);
            d3.select("#type_info_tooltiptext")
                .html("Anomaly temperature : is the difference between a baseline temperature and the absolute temperature for a given year");
            reset_slider();
            update();
        });


    d3.select('#country_data_annual')
        .on('change', function () {
            selected_data_year = "Annual";
            reset_slider();
            update();

        });
    d3.select('#country_data_5year')
        .on('change', function () {
            selected_data_year = "FiveYears";
            reset_slider();
            update();

        });
    d3.select('#country_data_10year')
        .on('change', function () {
            selected_data_year = "TenYears";
            reset_slider();
            update();

        });
    d3.select('#country_data_20year')
        .on('change', function () {
            selected_data_year = "TwentyYears";
            reset_slider();
            update();

        });
    d3.select('#country_data_min')
        .on('change', function () {
            selected_temperature_measure = "TMIN";
            reset_slider();
            update();

        });
    d3.select('#country_data_avg')
        .on('change', function () {
            selected_temperature_measure = "TAVG";
            reset_slider();
            update();

        });
    d3.select('#country_data_max')
        .on('change', function () {
            selected_temperature_measure = "TMAX";
            reset_slider();
            update();


        });

    d3.select('#play_speed_0_5X')
        .on('change', function () {
            selected_play_speed = 2000
            if (selected_data_type == "equal_erea")
                selected_play_speed = 4000
            update_timer();
        });
    d3.select('#play_speed_1X')
        .on('change', function () {
            selected_play_speed = 1000
            if (selected_data_type == "equal_erea")
                selected_play_speed = 2000
            update_timer();
        });
    d3.select('#play_speed_2X')
        .on('change', function () {
            selected_play_speed = 500
            if (selected_data_type == "equal_erea")
                selected_play_speed = 1000
            update_timer();
        });
    d3.select('#play_speed_4X')
        .on('change', function () {
            selected_play_speed = 250
            if (selected_data_type == "equal_erea")
                selected_play_speed = 500
            update_timer();
        });

}


function change_data_type(id, status) {
    div = $("#" + id);
    if (status) {

        div.show(500);
        d3.select('#' + id)
            .style('display', 'flex');
        // d3.select('#clear_div')
        // .style('clear','both')
    } else {
        div.hide(600);
    }

}

