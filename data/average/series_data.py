import csv
import json
import pandas as pd
import math

chemicals = list()

with open("../chemical_list.csv") as cf:
    rdr = csv.reader(cf)
    for row in rdr:
        for d in row:
            chemicals.append(d)

chemicals = chemicals[1:]
df = pd.read_csv('../organized.csv')
df = df.set_index('sampledate')

listloc = [
        "Boonsri",
        "Achara",
        "Kohsoom",
        "Busarakhan",
        "Chai",
        "Somchair",
        "Decha",
        "Tansanee",
        "Sakda",
        "Kannika"
        ]

def mean(list):
    if len(list) > 0:
        return sum(list) / len(list)
    else:
        return -1;

df.index = pd.to_datetime(df.index)

eachloc = list()
for loc in listloc:
    eachloc.append(df.loc[df['location'] == loc])
dailyloc = dict()
for i, series in enumerate(eachloc):
    dailyloc[listloc[i]] = dict()
    for chem in chemicals:
        newSeries = pd.Series(series[chem])
        temp = newSeries.resample('D').mean().interpolate()
        dailyloc[listloc[i]][chem] = temp.interpolate()
avgLoc = dict()
for loc in listloc:
    avgLoc[loc] = dict()
    for chem in dailyloc[loc].keys():
        avg = list()
        for day in range(0, 365):
            avg.append([])

        for i, amount in enumerate(dailyloc[loc][chem]):
            if not math.isnan(amount):
                avg[i % 365].append(amount)

        for i in range(0, 365):
            avg[i] = mean(avg[i])

        for i in range(0, 365):
            if math.isnan(avg[i]):
                print(-1)

        avgLoc[loc][chem] = avg
#jsonAvg = dict()
#jsonAvg['data'] = avgLoc
with open('avg_loc.json', 'w') as af:
    af.write(json.dumps(avgLoc, indent=2))
