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
let countries, countryAVG, counrtyMax, countryMin, monthlyAbsoluteData;

///////////////////////////////////////////////////////////

const fullWidth = 900;
const margin = { top: 40, right: 70, bottom: 30, left: 50 };
const width = fullWidth - margin.left - margin.right;
const height = (fullWidth * 9) / 16 - margin.top - margin.bottom;
const lineChartBoxX = width - 525,
  lineChartBoxY = -75;
const seasonalBoxX = 10,
  seasonalBoxY = 1;
const labelHight = 480;
const stripChartHight = 375;
const uncThreshold = 1;
const parseTime = d3.timeParse('%Y-%m');
const parseMonth = d3.timeParse('%m');

const MONTHES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const colors = ['#a000a0', '#009000', 'red'];
