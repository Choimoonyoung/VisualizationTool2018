import json
import datetime
import csv
import math

chemlist = list()

with open("../chemical_list.csv") as cf:
    rdr = csv.reader(cf)
    for row in rdr:
        for d in row:
            chemlist.append(d)
chemlist = chemlist[1:]

with open("../interpolated/newdata.json") as f:
    interData = json.load(f)

with open("../average/datedAvg.json") as af:
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

difference = dict()
for aday in interData.keys():
    difference[aday] = dict()
    for chem in interData[aday].keys():
        temp = dict()
        for loc in interData[aday][chem].keys():
            for avgDay in avgData[loc][chem]:
                if datetime.datetime.strptime(str(avgDay[0]), '%Y-%m-%d') == datetime.datetime.strptime(str(aday), '%Y-%m-%d'):
                    if avgDay[1] != 0:
                        temp[loc] = interData[aday][chem][loc]/avgDay[1]
                    else:
                        temp[loc] = 0
                    break;
        difference[aday][chem] = temp

with open("./difference.json", "w") as jf:
    json.dump(difference, jf, indent=2)


