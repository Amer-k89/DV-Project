var selected_view = 'main';
var selected_data_type = 'equal_erea';
var selected_data_year = 'Annual';
var selected_temperature_measure = 'TMIN';
var selected_play_speed = 1000;
var selected_country = undefined;
manage_view(selected_view);

function manage_view(view) {
  switch (view) {
    case 'main':
      var main_view = d3.select('#main_view');
      main_view.selectAll('*').remove();
      var map_table = main_view.append('table')
        .attr('height', '100%')
        .attr('width', '100%')

      var map_tr1 = map_table.append('tr')
        .attr('width', '100%');
      var map_tr1_td1 = map_tr1
        .append('td')
        .attr('id','global_td')
        .attr('height', '100%')
        .attr('width', '28%');
        var global_div = map_tr1_td1
        .append('div') 
        .attr('class', 'global_div')
        .attr('id', 'global_div')
        .attr('height', '100%')
        .attr('width', '100%');

        let data_control=global_div.append('div')
        .attr('class','data_control')
        .attr('height', '10%')
        .attr('width', '100%');
        
      var data_type = data_control
        .append('div') // Equal Erea tempreature , country tempreture
        .attr('class', 'radio-toolbar')
        .attr('width', '90%')
        .style('margin-right','auto')
        .style('display','flex');
        data_type.append('div')
        .attr('class','info_tooltip')
        .style('font-size','15px')
        .html('&#x1F6C8;')
        .append('span')
        .style('font-size','18px')
        .attr('class','info_tooltiptext')
        .attr('id','type_info_tooltiptext')
        .html("Equal Erea Tempreture : is a grided dataset based on dividing the Earth into 15984 equal-area grid cells with the avareged temperature");

      data_type
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'data_type_equal_erea')
        .attr('name', 'data_type_radio')
        .attr('value', 'equal_erea')
        .attr('checked', true);

      data_type
        .append('label')
        .attr('for', 'data_type_equal_erea')
        .html('Equal Erea Tempreture');

      data_type
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'data_type_Country')
        .attr('name', 'data_type_radio')
        .attr('value', 'country');
      //.checked();
      data_type
        .append('label')
        .attr('for', 'data_type_Country')
        .html('Anomaly Tempreture');

      let country_data_year = data_control
        .append('div') // , country tempreture Year  (annual - 5y  - 10y - 20y)
        .attr('class', 'radio-toolbar')
        .attr('id', 'country_data_year')
        .attr('width', '90%');
      //country_data_year.append('g');
      country_data_year
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'country_data_annual')
        .attr('name', 'country_data_radio')
        .attr('value', 'annual')
        .attr('checked', true);
      country_data_year
        .append('label')
        .attr('for', 'country_data_annual')
        .html('Annual');

      country_data_year
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'country_data_5year')
        .attr('name', 'country_data_radio')
        .attr('value', '5year');
      country_data_year
        .append('label')
        .attr('for', 'country_data_5year')
        .html('5 Year');

      country_data_year
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'country_data_10year')
        .attr('name', 'country_data_radio')
        .attr('value', '10year');
      country_data_year
        .append('label')
        .attr('for', 'country_data_10year')
        .html('10 Year');

      country_data_year
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'country_data_20year')
        .attr('name', 'country_data_radio')
        .attr('value', '20year');
      country_data_year
        .append('label')
        .attr('for', 'country_data_20year')
        .html('20 Year');

      let country_data_measure = data_control
        .append('div') // , country tempreture measure (min - avg - max)
        .attr('class', 'radio-toolbar')
        .attr('id', 'country_data_measure')
        .attr('width', '90%');
      country_data_measure
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'country_data_min')
        .attr('name', 'measure_data_radio')
        .attr('value', 'min')
        .attr('checked', true);
      country_data_measure
        .append('label')
        .attr('for', 'country_data_min')
        .html('Min');

      country_data_measure
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'country_data_avg')
        .attr('name', 'measure_data_radio')
        .attr('value', 'avg');
      country_data_measure
        .append('label')
        .attr('for', 'country_data_avg')
        .html('Avg');

      country_data_measure
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'country_data_max')
        .attr('name', 'measure_data_radio')
        .attr('value', 'max');
      country_data_measure
        .append('label')
        .attr('for', 'country_data_max')
        .html('Max');

         global_div
        .append('div')
        .attr('class', 'clear_div')
        .style('clear','both');

      var map_tr1_td2 = map_tr1
        .append('td')
        .attr('height', '100%')
        .attr('width', '65%');
      var map_view = map_tr1_td2
        .append('div')
        .attr('id', 'map_view')
        .attr('class', 'map_view');
      var map_tr1_td3 = map_tr1
        .append('td')
        .attr('height', '100%')
        .attr('width', '5%');

      map_type_zoom_div = map_tr1_td3.append('div').attr('id', 'map_type_zoom');


      var bottom_div = map_tr1_td2  
        .append('div') // slider , speed control, legend
        .attr('class', 'row bottom_div')
        .attr('width', '100%');
      var speed_div = bottom_div
        .append('div')
        .attr('id', 'speed_div')
        .attr('class', 'radio-toolbar');
      speed_div.append('h4').html('Play Speed');
      speed_div
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'play_speed_0_5X')
        .attr('name', 'play_speed')
        .attr('value', '_0_5X');
      speed_div.append('label').attr('for', 'play_speed_0_5X').html('0.5 X');

      speed_div
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'play_speed_1X')
        .attr('name', 'play_speed')
        .attr('value', '_1X')
        .attr('checked', true);
      speed_div.append('label').attr('for', 'play_speed_1X').html('1 X');

      speed_div
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'play_speed_2X')
        .attr('name', 'play_speed')
        .attr('value', '_2X');
      speed_div.append('label').attr('for', 'play_speed_2X').html('2 X');

      speed_div
        .append('input')
        .attr('type', 'radio')
        .attr('id', 'play_speed_4X')
        .attr('name', 'play_speed')
        .attr('value', '_4X');
      speed_div.append('label').attr('for', 'play_speed_4X').html('4 X');

      var legend_div = bottom_div
        .append('div')
        .attr('id', 'legend_div')
        .attr('class', 'col-8 ')
        .attr('align', 'center');
      //.style('border-style','solid')
      var slider_div = bottom_div.append('div').attr('class', 'col-12');

      var slider = slider_div
        .append('div')
        .attr('id', 'year_slider')
        .attr('height', '60px')
        .attr('width', '50%')
        .attr('class', 'col-11-5 slider_controls');
      break;

    case 'X':
      break;
    default:
    // code block
  }

}
$(document).ready(function () {
  $('#Info_Dialog').dialog({
    autoOpen: false,
    width: 600,
    buttons: {
      OK: function () {
        $('#country_info_name').text('');
        $('#country_info_flag').attr('src', '');
        $(this).dialog('close');
      },
      'More details': function () {
        result = countries_info.find(c => c.id == selected_country);
        if (result !== undefined) {
          window.location.href = `Details.html?countryCode=${result.alpha3.toUpperCase()}`;
        }

        $(this).dialog('close');
      },
    },
  });
});

function dropdownMenu_click() {
  var x = document.getElementById('dropdownMenu');
  if (x.className === 'topnav') {
    x.className += ' responsive';
  } else {
    x.className = 'topnav';
  }
}

