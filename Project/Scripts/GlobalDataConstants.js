const globalSummaryFilePath = '../Data/GlobalSummary/GlobalSummary.csv';
const globalSummaryMonthlyAbs =
  '../Data/GlobalSummary/GlobalSummary_monthlyAbsoluteTemperature.csv';

///////////////////////////////////////////////////////////

const fullWidth = 350;
const margin = { top: 0, right: 0, bottom: 0, left: 0 };
const width = fullWidth - margin.left - margin.right;
const height = (fullWidth * 9) / 16 - margin.top - margin.bottom;
const labelHight = 235;
const stripChartHight = 375;
const uncThreshold = 1;
const parseTime = d3.timeParse('%Y-%m');
const parseMonth = d3.timeParse('%m');

const MONTHES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const colors = ['#a000a0', '#009000', 'red'];
