#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Dec  5 15:30:24 2021

@author: amerkhoury
"""
import pandas as pd
import requests as req
from os import path
import os
import re
import urllib.parse
from enum import Enum

countryFile = './CountriesWithCodes.csv'
countriesFolder = './Countries/'
GolbalSummary = './GlobalSummary/'
baselineTempIndicator = 'Estimated Jan 1951-Dec 1980 absolute temperature (C):'
monthlyAbsolutTemp = 'Estimated Jan 1951-Dec 1980 monthly absolute temperature (C):'

class FileType(Enum):
    TAVG = '-TAVG-Trend.txt'
    TMAX = '-TMAX-Trend.txt'
    TMIN = '-TMIN-Trend.txt'
    GLOB = 'global-land-TAVG-Trend.txt'
    GLOBMAX = 'global-land-TMAX-Trend.txt'
    GLOBMIN = 'global-land-TMIN-Trend.txt'

def getBaseURL(Type):
    if Type == FileType.TAVG:
        return 'http://berkeleyearth.lbl.gov/auto/Regional/TAVG/Text/'
    elif Type == FileType.TMAX:
        return 'http://berkeleyearth.lbl.gov/auto/Regional/TMAX/Text/'
    elif Type == FileType.TMIN:
        return 'http://berkeleyearth.lbl.gov/auto/Regional/TMIN/Text/'
    elif Type == FileType.GLOB:
        return 'http://berkeleyearth.lbl.gov/auto/Regional/TAVG/Text/'
    elif Type == FileType.GLOBMAX:
        return 'http://berkeleyearth.lbl.gov/auto/Regional/TMAX/Text/'
    elif Type == FileType.GLOBMIN:
        return 'http://berkeleyearth.lbl.gov/auto/Regional/TMIN/Text/'
    
def ParseText(countryName, countryCode, countryFolder, content, Type):
    #Parse Data
    tableDataFrame = None
    absoluteTemp = None
    absoluteTempUnc = None
    monthlyTemp = None
    while True:
        endIndex = content.find('\n')
        line = content[:endIndex]
        if line[0] == '%':
            if line.find(baselineTempIndicator) != -1:
                neededTemp = line.split(':')[1]
                rowData = re.sub(' ','', neededTemp).split('+/-')
                absoluteTemp = rowData[0]
                absoluteTempUnc = rowData[1]
            elif line.find(monthlyAbsolutTemp) != -1:
                content = content[endIndex+1:]
                endIndex = content.find("\n")
                month = content[:endIndex]
                month = re.sub('\s+', ' ', month[1:]).split(" ")
                content = content[endIndex+1:]
                endIndex = content.find("\n")
                temp = content[:endIndex]
                temp = re.sub('\s+', ' ', temp[2:]).split(" ")
                content = content[endIndex+1:]
                endIndex = content.find("\n")
                unc_tmp = content[:endIndex].replace("+/-", "")
                unc_tmp = re.sub('\s+', ' ', unc_tmp[2:]).split(" ")
                monthlyTemp = pd.DataFrame([temp[1:], unc_tmp[1:]], columns=month[1:])
                
            content = content[endIndex+1:]
            continue
        else:
            content = content[endIndex+1:]
            data = []
            while content:
                endIndex = content.find("\n")
                line = content[:endIndex].strip()
                rowData = re.sub(' +', ' ', line).split(' ')
                rowData.append(absoluteTemp)
                rowData.append(absoluteTempUnc)
                data.append(rowData)
                content = content[endIndex+1:]
            
            columns = ["Year", "Month",
                       "MonthlyAnomaly", "MonthlyUnc",
                       "AnnualAnomaly", "AnnualUnc",
                       "FiveYearsAnomaly", "FiveYearsUnc",
                       "TenYearsAnomaly", "TenYearsUnc",
                       "TwentyYearsAnomaly", "TwentyYearsUnc", 
                       "absoluteTemp", "absoluteTempUnc"]
            tableDataFrame = pd.DataFrame(data, columns=columns)
        break
    
    #Save File
    if Type == FileType.TAVG:
        tableDataFrame.to_csv(path.join(countryFolder, countryCode + '_AnnomalyAVG.csv'))
        monthlyTemp.to_csv(path.join(countryFolder, countryCode + "_monthlyAbsoluteTemperature_AVG.csv"))
    elif Type == FileType.TMAX:
        tableDataFrame.to_csv(path.join(countryFolder, countryCode + '_TMAX.csv'))
        monthlyTemp.to_csv(path.join(countryFolder, countryCode + "_monthlyAbsoluteTemperature_MAX.csv"))
    elif Type == FileType.TMIN:
        tableDataFrame.to_csv(path.join(countryFolder, countryCode + '_TMIN.csv'))
        monthlyTemp.to_csv(path.join(countryFolder, countryCode + "_monthlyAbsoluteTemperature_MIN.csv"))
    else:
        tableDataFrame.to_csv(path.join(countryFolder, countryCode + '.csv'))
        monthlyTemp.to_csv(path.join(countryFolder, countryCode + "_monthlyAbsoluteTemperature.csv"))

def downloadFile(countryName, countryCode, countryFolder, Type):
    #URL
    countryURLName = urllib.parse.quote_plus(re.sub(' ', '-', countryName.lower()), encoding='cp1252')
    datafolderURL = getBaseURL(Type) +  countryURLName + Type.value
    
    #download Data
    response = req.get(datafolderURL, allow_redirects=True)
    if response.status_code != 200:
        return
    
    content = response.content.decode("ISO-8859-1", "backslashreplace")
    
    ParseText(countryName, countryCode, countryFolder, content, Type)
    
    
def downloadGlobalFile(name ,Type):
    #URL
    datafolderURL = getBaseURL(Type) + Type.value
    
        #download Data
    response = req.get(datafolderURL, allow_redirects=True)
    if response.status_code != 200:
        return
    
    content = response.content.decode("ISO-8859-1", "backslashreplace")
    ParseText('', name, GolbalSummary, content, Type)
    
     
fileDataframe = pd.read_csv(countryFile)
for index, row in fileDataframe.iterrows():
    countryCode = row[4]
    countryName = row[1]
    
    #create folder
    countryFolder = countriesFolder + countryCode
    os.makedirs(countryFolder)
    downloadFile(countryName, countryCode, countryFolder, FileType.TAVG)
    downloadFile(countryName, countryCode, countryFolder, FileType.TMAX)
    downloadFile(countryName, countryCode, countryFolder, FileType.TMIN)
    
downloadGlobalFile('GlobalSummary_AVG', FileType.GLOB);
downloadGlobalFile('GlobalSummary_MAX', FileType.GLOBMAX);
downloadGlobalFile('GlobalSummary_MIN', FileType.GLOBMIN);