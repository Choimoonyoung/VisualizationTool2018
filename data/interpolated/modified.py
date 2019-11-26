import json
import csv
import datetime

chemlist = list()

with open("../chemical_list.csv") as cf:
    rdr = csv.reader(cf)
    for row in rdr:
        for d in row:
            chemlist.append(d)

chemlist = chemlist[1:]
with open("../organized.json") as f:
    data = json.load(f)

data = data['data']

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
dt = datetime.datetime(1998, 1, 11)
end = datetime.datetime(2017, 1, 1)
step = datetime.timedelta(days = 1)

result = []
while dt < end:
    result.append(dt.strftime('%Y-%m-%d'))
    dt += step


newdata = dict()
for aday in result:
    newdata[aday] = dict()
    for chem in chemlist:
        newdata[aday][chem] = dict()
    for row in data:
        if row['date'] == aday:
            for chem in chemlist:
                if chem in row.keys():
                    newdata[aday][chem][row['location']] = row[chem]

for chem in chemlist:
    for loc in listloc:
        beforeVal = -1
        toDo = []

        for aday in result:
            if not loc in newdata[aday][chem].keys():
                if beforeVal != -1:
                    toDo.append(aday)
            else:
                if beforeVal != -1:
                    if len(toDo) != 0:
                        step = (newdata[aday][chem][loc] - beforeVal) / len(toDo)
                    for i, toDoDay in enumerate(toDo):
                        newdata[toDoDay][chem][loc] = beforeVal + (step * (i + 1));

                beforeVal = newdata[aday][chem][loc];
with open("./newdata.json", "w") as jf:
    json.dump(newdata, jf, indent=2)



