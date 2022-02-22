#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Dec 12 12:56:52 2021

@author: amerkhoury
"""
import os
import pandas as pd
import json

dataFolder = './Countries/'
SavedTo = './Years/'
CountriesNames = './Countries.csv'
jsonCountriesFolder = './countries.json'

#extension = '_AnnomalyAVG.csv'
#extension = '_TMAX.csv'
extension = '_TMIN.csv'

minYear = 9999
maxYear = -9999

f = open(jsonCountriesFolder)
countriesData= json.load(f)

def getMinMaxYear(df):
    global minYear, maxYear
    yearsDF = df.filter(["Year"], axis=1)
    yearsDF.sort_values("Year", inplace = True)
    first = yearsDF.head(1)["Year"].tolist()[0]
    last = yearsDF.tail(1)["Year"].tolist()[0]
    if first <= minYear:
        minYear = first
    if last >= maxYear:
        maxYear = last

def findCountryID(code):
    for currentCountry in countriesData:
        if code.lower() == currentCountry['alpha3']:
            return currentCountry['id']
            

folderlist = [os.path.join(dataFolder, country) for country in os.listdir(dataFolder)]

for index, path in enumerate(folderlist):
    countryCode = path.split('/')[2]
    if (countryCode[0]!= '.'):
        df = pd.read_csv(path + '/' + countryCode.lower() + extension)
        getMinMaxYear(df)

dataAnnualAnnomaly = []
dataFiveYearsAnnomaly = []
dataTenYearsAnnomaly = []
dataTwentyYearsAnnomaly = []
for year in range(minYear, maxYear+1):
    dataAnnualAnnomaly = []
    dataFiveYearsAnnomaly = []
    dataTenYearsAnnomaly = []
    dataTwentyYearsAnnomaly = []
    for index, path in enumerate(folderlist):
        countryCode = path.split('/')[2]
        countryID = findCountryID(countryCode)
        if (countryCode[0]!= '.'):
            df = pd.read_csv(path + '/' + countryCode.lower() + extension)
            annualAnomaly = df[(df["Year"] == year) & (df["Month"] == 6)]["AnnualAnomaly"].values
            if len(annualAnomaly) == 0:
                dataAnnualAnnomaly.append([countryID, countryCode, None])
            else:
                dataAnnualAnnomaly.append([countryID, countryCode, annualAnomaly[0]])
                
            fiveYearsAnomaly = df[(df["Year"] == year) & (df["Month"] == 6)]["FiveYearsAnomaly"].values
            if len(fiveYearsAnomaly) == 0:
                dataFiveYearsAnnomaly.append([countryID, countryCode, None])
            else:
                dataFiveYearsAnnomaly.append([countryID, countryCode, fiveYearsAnomaly[0]])
            
            tenYearsAnomaly = df[(df["Year"] == year) & (df["Month"] == 6)]["TenYearsAnomaly"].values
            if len(tenYearsAnomaly) == 0:
                dataTenYearsAnnomaly.append([countryID, countryCode, None])
            else:
                dataTenYearsAnnomaly.append([countryID, countryCode, tenYearsAnomaly[0]])
                
            twentyYearsAnomaly = df[(df["Year"] == year) & (df["Month"] == 6)]["TwentyYearsAnomaly"].values
            if len(twentyYearsAnomaly) == 0:
                dataTwentyYearsAnnomaly.append([countryID, countryCode, None])
            else:
                dataTwentyYearsAnnomaly.append([countryID, countryCode, twentyYearsAnomaly[0]])
    
    savedToPath = SavedTo + str(year)
    if not os.path.exists(savedToPath):
        os.makedirs(savedToPath)
    
    columns = ['id', 'Code', 'Temp']
    annualAnomalyDF = pd.DataFrame(dataAnnualAnnomaly, columns=columns).sort_values(by=['id'])
    fiveYearsAnomalyDF = pd.DataFrame(dataFiveYearsAnnomaly, columns=columns).sort_values(by=['id'])
    tenYearsAnomalyDF = pd.DataFrame(dataTenYearsAnnomaly, columns=columns).sort_values(by=['id'])
    twentyYearsAnomalyDF = pd.DataFrame(dataTwentyYearsAnnomaly, columns=columns).sort_values(by=['id'])
    
    #Save File
    #annualAnomalyDF.to_csv(savedToPath + '/TAVG_AnnualAnomaly.csv')
    #fiveYearsAnomalyDF.to_csv(savedToPath + '/TAVG_FiveYearsAnomaly.csv')
    #tenYearsAnomalyDF.to_csv(savedToPath + '/TAVG_TenYearsAnomaly.csv')
    #twentyYearsAnomalyDF.to_csv(savedToPath + '/TAVG_TwentyYearsAnomaly.csv')
    
    #annualAnomalyDF.to_csv(savedToPath + '/TMAX_AnnualAnomaly.csv')
    #fiveYearsAnomalyDF.to_csv(savedToPath + '/TMAX_FiveYearsAnomaly.csv')
    #tenYearsAnomalyDF.to_csv(savedToPath + '/TMAX_TenYearsAnomaly.csv')
    #twentyYearsAnomalyDF.to_csv(savedToPath + '/TMAX_TwentyYearsAnomaly.csv')
    
    annualAnomalyDF.to_csv(savedToPath + '/TMIN_AnnualAnomaly.csv')
    fiveYearsAnomalyDF.to_csv(savedToPath + '/TMIN_FiveYearsAnomaly.csv')
    tenYearsAnomalyDF.to_csv(savedToPath + '/TMIN_TenYearsAnomaly.csv')
    twentyYearsAnomalyDF.to_csv(savedToPath + '/TMIN_TwentyYearsAnomaly.csv')
    
f.close()
