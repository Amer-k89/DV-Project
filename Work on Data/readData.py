#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat May 22 17:42:17 2021

@author: amerkhoury
"""

import netCDF4 as nc
import numpy as np
import numpy.ma as ma
import pandas as pd
import math
import json

file = 'Land_and_Ocean_EqualArea.nc'
ds = nc.Dataset(file)

print (ds)
latitude = ds['latitude'][:]
longitude = ds['longitude'][:]
time = ds['time'][:]
temp = ds['temperature'][:]

te = ma.getdata(temp)
print(ds)
#print(latitude)
#print(longitude)
#print (time)
#print(temp)
data = []

"""
# Model
class Tempreture:
    def __init__(self, lng, lat, temp):
        self.longitude = str(lng)
        self.latitude = str(lat)
        self.temperature = str(temp)
        
    def toJSON(self):
        '''
        Serialize the object custom object
        '''
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)
    
class Date:
    def __init__(self, date):
        self.date = str(date)
        self.data = []
        
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)
        
"""

#All Data To CSV
#Multiple CSV files
"""
for timeCounter in range(time.shape[0]):
    format_num = '{0:.3f}'.format(time[timeCounter])
    if float(format_num) >= 1970:
        data = []
        for latitudeCounter in range(latitude.shape[0]):
            if (not (math.isnan(te[timeCounter,latitudeCounter]))):
                data += [[longitude[latitudeCounter], latitude[latitudeCounter], te[timeCounter,latitudeCounter]]]
        finalDF = pd.DataFrame(data, columns = ['longitude', 'latitude', 'temp'])
        finalDF.to_csv('CSVs/'+ format_num + '.csv', index = False)
"""
"""
for timeCounter in range(time.shape[0]):
    format_num = '{0:.3f}'.format(time[timeCounter])
    if float(format_num) >= 1970:
        currentDate = Date(format_num)
        for latitudeCounter in range(latitude.shape[0]):
            if (not (math.isnan(te[timeCounter,latitudeCounter]))):
                temp = Tempreture(longitude[latitudeCounter],latitude[latitudeCounter], te[timeCounter,latitudeCounter])
                currentDate.data.append(temp)
        data.append(currentDate)
        
with open("outfile.json", "w") as outfile:
    jsonStr = '[ \n'
    jsonStr += ", \n".join(item.toJSON() for item in data)
    jsonStr += '\n ]'
    outfile.write(jsonStr)
"""
        
"""
for timeCounter in range(time.shape[0]):
    format_num = '{0:.3f}'.format(time[timeCounter])
    if float(format_num) >= 1970:
        for latitudeCounter in range(latitude.shape[0]):
            if (not (math.isnan(te[timeCounter,latitudeCounter]))):
                #data += [[format_num, longitude[latitudeCounter], latitude[latitudeCounter], te[timeCounter,latitudeCounter]]]
                temp = Tempreture(format_num, longitude[latitudeCounter],latitude[latitudeCounter], te[timeCounter,latitudeCounter])
                data.append(temp)

with open("outfile", "w") as outfile:
    outfile.write(", \n".join(item.toJSON() for item in data))
#print(json.dumps(data[0].toJSON()))

#finalDF = pd.DataFrame(data, columns = ['Date', 'longitude', 'latitude', 'temp'])

#finalDF.to_csv('TAVG.csv', index = False)
"""
"""
for timeCounter in range(time.shape[0]):
    format_num = '{0:.3f}'.format(time[timeCounter])
    for longitudeCounter in range(longitude.shape[0]):
#        for latitudeCounter in range(latitude.shape[0]):
            if (not (math.isnan(te[timeCounter,longitudeCounter]))):
                print(te[timeCounter, longitudeCounter]);
                #data += [[format_num, longitude[longitudeCounter], latitude[latitudeCounter], te[timeCounter,latitudeCounter,longitudeCounter]]]
                
#finalDF = pd.DataFrame(data, columns = ['Date', 'longitude', 'latitude', 'temp'])

#finalDF.to_csv('TAVG.csv', index = False)
"""
"""
for timeCounter in range(time.shape[0]):
    format_num = '{0:.3f}'.format(time[timeCounter])
    summation = 0
    count = 0
    for longitudeCounter in range(longitude.shape[0]):
        for latitudeCounter in range(latitude.shape[0]):
            if (not (math.isnan(te[timeCounter,latitudeCounter,longitudeCounter]))):
                summation = summation + te[timeCounter,latitudeCounter,longitudeCounter]
                count = count + 1
    if count > 0:
        avg = summation / count
        data += [[format_num, avg]]
    else:
        data += [[format_num, 0]]

finalDF = pd.DataFrame(data, columns = ['Date', 'tempAVG'])

finalDF.to_csv('TMIN_AVG.csv', index = False)
"""