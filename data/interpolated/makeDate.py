import datetime
import json

dt = datetime.datetime(1998, 1, 11)
end = datetime.datetime(2017, 1, 1)
step = datetime.timedelta(days = 1)

result = []
while dt < end:
    result.append(dt.strftime('%Y-%m-%d'))
    dt += step

with open("./date.json", "w") as f:
    json.dump(result,f,indent=2)
