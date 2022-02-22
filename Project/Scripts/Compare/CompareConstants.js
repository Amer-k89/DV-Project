const countriesPath = '../Data/CountriesWithCodes.csv';
const avgExtention = '_AnnomalyAVG.csv';
const avgMonthlyExtention = '_monthlyAbsoluteTemperature_AVG.csv';
const maxExtention = '_TMAX.csv';
const minExtention = '_TMIN.csv';
const countryFolderData = '../Data/Countries/';
const flagFolder = '../Data/Flags/';
const countryJsonFile = '../Data/countries.json';
const mapImageLink = 'http://berkeleyearth.lbl.gov/auto/Regional/General/Maps/';
const globalImageSrc = '-Global.png';
const localImageSrc = '-Local.png';

///////////////////////////////////////////////////////////

const fullWidth = 600;
const margin = { top: 40, right: 70, bottom: 30, left: 50 };
const width = fullWidth - margin.left - margin.right;
const height = (fullWidth * 9) / 16 - margin.top - margin.bottom;
const lineChartBoxX = width - 400,
  lineChartBoxY = -75;
const seasonalBoxX = 130,
  seasonalBoxY = -60;
const labelHight = 310;
const stripChartHight = 220;
const uncThreshold = 1;
const parseTime = d3.timeParse('%Y-%m');
const parseMonth = d3.timeParse('%m');

const MONTHES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const colors = ['#a000a0', '#009000', 'red'];

let annualMin = 1000,
  fiveYearsMin = 1000,
  tenYearsMin = 1000,
  twentyYearsMin = 1000;
let annualMax = -1000,
  fiveYearsMax = -1000,
  tenYearsMax = -1000,
  twentyYearsMax = -1000;
