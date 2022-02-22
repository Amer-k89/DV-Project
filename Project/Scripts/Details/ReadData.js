const currentURL = new URL(window.location.href);
let currentCountryCode = currentURL.searchParams.get('countryCode')
  ? currentURL.searchParams.get('countryCode')
  : 'ITA';
const buttonForm = document.getElementById('SelectedButton');
let type = 'annual';

buttonForm.addEventListener('change', function (e) {
  e.preventDefault();
  const data = Object.fromEntries([...new FormData(this)]);
  type = data['showType'];
  drawChart(countryAVG, type, 'linechart', true);
  drawChart(countryMin, type, 'linechart_min', true);
  drawChart(counrtyMax, type, 'linechart_max', true);
  serComparedDataType(type);
});

// Read Countries Data Function
function ReadData(filePath) {
  d3.csv(filePath)
    .then(function (csv) {
      countries = csv;
      const country = countries.filter(d => d.Code === currentCountryCode)[0];
      autocomplete(
        document.getElementById('otherCountryName'),
        countries.map(c => c.RealName)
      );
      autocomplete(
        document.getElementById('newCountryName'),
        countries.map(c => c.RealName)
      );
      submitSearch(
        document.getElementById('searchForm'),
        countries,
        country,
        type
      );
      changeCountryDetails(
        document.getElementById('ChangeCountryForm'),
        countries,
        country
      );
      handelSideBar(country);
      readCountryData(country, 'min');
      readCountryData(country, 'avg');
      readCountryData(country, 'max');
    })
    .catch(function (err) {
      console.log(err);
      throw err;
    });
}

function readCountryData(country, type) {
  let path = countryFolderData + country.Code + '/' + country.Code;
  path =
    type === 'min'
      ? path + minExtention
      : type === 'max'
      ? path + maxExtention
      : path + avgExtention;
  d3.csv(path)
    .then(function (csv) {
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

      switch (type) {
        case 'min':
          countryMin = csv;
          drawChart(countryMin, 'annual', 'linechart_min');
          break;
        case 'max':
          counrtyMax = csv;
          drawChart(counrtyMax, 'annual', 'linechart_max');
          break;
        default:
          countryAVG = csv;
          const monthlyPath =
            countryFolderData +
            country.Code +
            '/' +
            country.Code +
            avgMonthlyExtention;

          d3.csv(monthlyPath)
            .then(function (monthlyCSV) {
              monthlyCSV.forEach(function (d) {
                d.Jan = +d.Jan;
                d.Feb = +d.Feb;
                d.Mar = +d.Mar;
                d.Apr = +d.Apr;
                d.May = +d.May;
                d.Jun = +d.Jun;
                d.Jul = +d.Jul;
                d.Aug = +d.Aug;
                d.Sep = +d.Sep;
                d.Oct = +d.Oct;
                d.Nov = +d.Nov;
                d.Dec = +d.Dec;
              });

              monthlyAbsoluteData = monthlyCSV;
              parseSeasonalData(monthlyAbsoluteData);

              drawChart(countryAVG, 'annual', 'linechart');
              drawStrips(countryAVG, 'stripesChartContainer', 'annual');
              showChart(countryAVG, monthlyAbsoluteData, 'seasonlChangeGraph');
              initTables(countryAVG);
            })
            .catch(function (err) {
              console.log(err);
              throw err;
            });
          break;
      }
    })
    .catch(function (err) {
      console.log(err);
      throw err;
    });
}

// Handle Data

function parseSeasonalData(csv) {
  csv.seasonalData = csv[0];
  csv.seasonalUnc = csv[1];
}

function handelSideBar(country) {
  d3.json(countryJsonFile)
    .then(function (json) {
      const countryJSON = json.filter(
        d => d.alpha3 === country.Code.toLowerCase()
      )[0];

      // SetTitle
      const title = document.getElementById('title');
      title.innerHTML += ` ${country.Country}`;

      //flagimage
      const flagImage = document.getElementById('flagImage');
      flagImage.src = `${flagFolder}${countryJSON.alpha2}.png`;

      const globalImage = document.getElementById('globalImage');
      globalImage.src = `${mapImageLink}${country.Country.toLowerCase()}${globalImageSrc}`;

      const localImage = document.getElementById('localImage');
      localImage.src = `${mapImageLink}${country.Country.toLowerCase()}${localImageSrc}`;
    })
    .catch(function (err) {
      console.log(err);
      throw err;
    });
}

ReadData(countriesPath);
