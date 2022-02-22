const currentURL = new URL(window.location.href);
const firstCountry = currentURL.searchParams.get('FirstCountry')
  ? currentURL.searchParams.get('FirstCountry')
  : 'ITA';
const secondCountry = currentURL.searchParams.get('SecondCountry')
  ? currentURL.searchParams.get('SecondCountry')
  : 'DEU';

//First Country
const firstCountryTitle = document.getElementById('firstCountryTitle');
const firstCountryImage = document.getElementById('firstCountryFlagImage');
firstCountryTitle.addEventListener('click', goToCountryDetails);
firstCountryImage.addEventListener('click', goToCountryDetails);

//Second Country
const secondCountryTitle = document.getElementById('secondCountryTitle');
const secondCountryImage = document.getElementById('secondCountryFlagImage');
secondCountryTitle.addEventListener('click', goToCountryDetails);
secondCountryImage.addEventListener('click', goToCountryDetails);

let dataType = 'annual';
let countries;
serComparedDataType(dataType);

// Select Type Form
const selectTypeForm = document.getElementById('selectType');

function createInputRadioButton(type, selecedType) {
  const fieldName = type[0].toUpperCase() + type.slice(1);
  const html = `<input
  id="${fieldName}YearsButton"
  type="radio"
  name="showType"
  value="${type}"
  ${selecedType === type ? `checked="checked"` : ''}/>`;
  return html;
}

function createRadioButtonLabel(type) {
  const fieldName = type[0].toUpperCase() + type.slice(1);
  const yearsStr = type !== 'annual' ? ' Years' : '';
  const html = `<label id="${fieldName}YearsButton-label" for="${fieldName}YearsButton">${fieldName}${yearsStr} Anomaly</label>`;
  return html;
}

function initSelectTypeForm() {
  const annualButton = `<div>${createInputRadioButton(
    'annual',
    dataType
  )}${createRadioButtonLabel('annual')}</div>`;
  selectTypeForm.innerHTML += annualButton;

  const fiveButton = `<div>${createInputRadioButton(
    'five',
    dataType
  )}${createRadioButtonLabel('five')}</div>`;
  selectTypeForm.innerHTML += fiveButton;

  const tenButton = `<div>${createInputRadioButton(
    'ten',
    dataType
  )}${createRadioButtonLabel('ten')}</div>`;
  selectTypeForm.innerHTML += tenButton;

  const twentyButton = `<div>${createInputRadioButton(
    'twenty',
    dataType
  )}${createRadioButtonLabel('twenty')}</div>`;
  selectTypeForm.innerHTML += twentyButton;
}

selectTypeForm.addEventListener('change', function (e) {
  e.preventDefault();
  const data = Object.fromEntries([...new FormData(this)]);
  dataType = data['showType'];
  readCountryDataCompare(countries, 'min', true);
  readCountryDataCompare(countries, 'max', true);
  readCountryDataCompare(countries, 'avg', true);
});

readData(countriesPath, firstCountry, secondCountry);
// Read Data function
function readData(filePath, country1, country2) {
  initSelectTypeForm();
  d3.csv(filePath)
    .then(function (csv) {
      const countriesNames = csv.map(c => c.RealName);
      countries = [
        csv.find(d => d.Code === country1),
        csv.find(d => d.Code === country2),
      ];
      autocomplete(
        document.getElementById('otherCountryName1'),
        countriesNames
      );
      autocomplete(
        document.getElementById('otherCountryName2'),
        countriesNames
      );
      changeCountry(
        document.getElementById('Country1Change'),
        csv,
        countries,
        'first'
      );
      changeCountry(
        document.getElementById('Country2Change'),
        csv,
        countries,
        'second'
      );
      handleCountriesData(countries);
      readCountryDataCompare(countries, 'avg');
      readCountryDataCompare(countries, 'min');
      readCountryDataCompare(countries, 'max');
    })
    .catch(function (err) {
      console.log(err);
      throw err;
    });
}

function readCountryDataCompare(countries, type, isUpdate = false) {
  countries.forEach((country, index) => {
    let path = countryFolderData + country.Code + '/' + country.Code;
    path =
      type === 'min'
        ? path + minExtention
        : type === 'max'
        ? path + maxExtention
        : path + avgExtention;
    d3.csv(path)
      .then(function (csv) {
        csv.forEach(d => {
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

          if (d.AnnualAnomaly - d.AnnualUnc + d.absoluteTemp < annualMin)
            annualMin = d.AnnualAnomaly - d.AnnualUnc + d.absoluteTemp;
          if (d.AnnualAnomaly + d.AnnualUnc + d.absoluteTemp > annualMax)
            annualMax = d.AnnualAnomaly + d.AnnualUnc + d.absoluteTemp;

          if (
            d.FiveYearsAnomaly - d.FiveYearsUnc + d.absoluteTemp <
            fiveYearsMin
          )
            fiveYearsMin = d.FiveYearsAnomaly - d.FiveYearsUnc + d.absoluteTemp;
          if (
            d.FiveYearsAnomaly + d.FiveYearsUnc + d.absoluteTemp >
            fiveYearsMax
          )
            fiveYearsMax = d.FiveYearsAnomaly + d.FiveYearsUnc + d.absoluteTemp;

          if (d.TenYearsAnomaly - d.TenYearsUnc + d.absoluteTemp < tenYearsMin)
            tenYearsMin = d.TenYearsAnomaly - d.TenYearsUnc + d.absoluteTemp;
          if (d.TenYearsAnomaly + d.TenYearsUnc + d.absoluteTemp > tenYearsMax)
            tenYearsMax = d.TenYearsAnomaly + d.TenYearsUnc + d.absoluteTemp;

          if (
            d.TwentyYearsAnomaly - d.TwentyYearsUnc + d.absoluteTemp <
            twentyYearsMin
          )
            twentyYearsMin =
              d.TwentyYearsAnomaly - d.TwentyYearsUnc + d.absoluteTemp;
          if (
            d.TwentyYearsAnomaly + d.TwentyYearsUnc + d.absoluteTemp >
            twentyYearsMax
          )
            twentyYearsMax =
              d.TwentyYearsAnomaly + d.TwentyYearsUnc + d.absoluteTemp;
        });
      })
      .catch(function (err) {
        console.log(err);
        throw err;
      });
  });

  countries.forEach((country, index) => {
    const countryAnnotation = index === 0 ? 'firstCountry' : 'secondCountry';

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
            drawChart(
              csv,
              dataType,
              `${countryAnnotation}linechart_min`,
              isUpdate,
              'min'
            );
            break;
          case 'max':
            drawChart(
              csv,
              dataType,
              `${countryAnnotation}linechart_max`,
              isUpdate,
              'max'
            );
            break;
          default:
            const avgData = csv;
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

                const monthlyAVGAbs = monthlyCSV;
                parseSeasonalData(monthlyAVGAbs);

                drawChart(
                  avgData,
                  dataType,
                  `${countryAnnotation}Linechart`,
                  isUpdate,
                  'avg'
                );
                drawStrips(
                  avgData,
                  `${countryAnnotation}StripesChartContainer`,
                  'annual'
                );
                showChart(
                  avgData,
                  monthlyAVGAbs,
                  `${countryAnnotation}SeasonlChangeGraph`
                );
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
  });
}

function parseSeasonalData(csv) {
  csv.seasonalData = csv[0];
  csv.seasonalUnc = csv[1];
}

function handleCountriesData(countries) {
  d3.json(countryJsonFile)
    .then(function (json) {
      countries.forEach((country, index) => {
        const countryAnnotation =
          index === 0 ? 'firstCountry' : 'secondCountry';
        const countryJSON = json.filter(
          d => d.alpha3 === country.Code.toLowerCase()
        )[0];

        const title = document.getElementById(`${countryAnnotation}Title`);
        title.innerHTML += ` ${country.Country}`;

        //flagimage
        const flagImage = document.getElementById(
          `${countryAnnotation}FlagImage`
        );
        flagImage.src = `${flagFolder}${countryJSON.alpha2}.png`;
      });
    })
    .catch(function (err) {
      console.log(err);
      throw err;
    });
}

function goToCountryDetails(ev) {
  ev.preventDefault();
  if (
    ev.target.id === 'firstCountryTitle' ||
    ev.target.id === 'firstCountryFlagImage'
  ) {
    window.location.href = `Details.html?countryCode=${firstCountry}`;
  } else {
    window.location.href = `Details.html?countryCode=${secondCountry}`;
  }
}
