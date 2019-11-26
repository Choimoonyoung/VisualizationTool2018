import json
import datetime
import csv

chemlist = list()

with open("../chemical_list.csv") as cf:
    rdr = csv.reader(cf)
    for row in rdr:
        for d in row:
            chemlist.append(d)
chemlist = chemlist[1:]

with open("../interpolated/newdata.json") as f:
    newdata = json.load(f)

with open("avg_loc.json") as af:
    avgData = json.load(af)
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
startDate = dict()
for loc in listloc:
    startDate[loc] = dict()
    for chem in chemlist:
        startDate[loc][chem] = 0;


for loc in listloc:
    for chem in chemlist:
        for aday in newdata.keys():
            try:
                temp = newdata[aday][chem][loc]
                startDate[loc][chem] = aday
                break;
            except:
                continue
initTime = datetime.datetime(1998, 1, 11)
endTime = datetime.datetime(2017, 1, 1)
step = datetime.timedelta(days = 1)
result = []
while initTime < endTime:
    result.append(initTime.strftime("%Y-%m-%d"))
    initTime += step


for loc in listloc: 
    for chem in chemlist:
        for avg in avgData[loc][chem]:
            resultData[avg[0]]


for loc in listloc:
    for chem in chemlist:
        if startDate[loc][chem] != 0:
            temp = list()
            dt = datetime.datetime.strptime(str(startDate[loc][chem]), '%Y-%m-%d')
            for d in avgData[loc][chem]:
                temp.append([dt.strftime('%Y-%m-%d'), d])
                dt += step
            avgData[loc][chem] = temp



with open("./datedAvg.json", "w") as jf:
    json.dump(avgData, jf, indent=2)
