var listloc = [
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
];
var threshold = 45;


/* get units */
var units = {};
d3.json("../data/units.json", function (error, json) {
    for (var unit in json) units[unit] = json[unit];
});
var currentDate = 0;
var loc_ingredients = {};
var dataloc = {};
var index = 0;
var ingredients = [];
var offsetYDict = {};
var colorLoc = {};
var colorTrend = d3.scaleOrdinal(d3.schemeCategory20);
for (var i in listloc) {
    colorLoc[listloc[i]] = colorTrend(listloc[i]);
}
let graphHeight = 100;
let graphWidth = 980;
let trendSvg = d3.select("#trend")
    .attr('height', function () {
        return graphHeight * 106;
    });
let graphsG = trendSvg.append('g')
    .attr('class', 'graphs')

var categoryList = {'Signal': 0, 'Metal': 0, 'IARC': 0, 'POPs': 0};
var parseTime = d3.timeParse("%Y-%m-%d");
var twentyData;
var diffData;
var keys;
var clickcal = [];
var clickdot = [];
let maxs = {}
let location_chem = [];
let chemical_list = [];
let selected_location = [];
let selected_stats = [];
let row_orders = chemical_list;


readLocationChemical();

var signalList = {};
d3.json("../data/category/category_Signal.json", function (error, data) {
    categoryList['Signal'] = data;
    for (var c in categoryList['Signal']) {
        signalList[c] = categoryList['Signal'][c];
    }
});
d3.json("../data/category/category_Metal.json", function (error, data) {
    categoryList['Metal'] = data;
});
d3.json("../data/category/category_POPs.json", function (error, data) {
    categoryList['POPs'] = data;
});
d3.json("../data/category/category_IARC.json", function (error, data) {
    categoryList['IARC'] = data;
});

function chemicalLoad() {
    d3.csv("../data/chemical_list.csv", function (error, data) {
        data.forEach(function (d) {
            chemical_list.push(d.chemicals)
        });
        // console.log(chemical_list);
        chemical_list.sort();
    })
    // console.log(chemical_list)
}

listloc.sort();

chemicalLoad();

/*get chemicals list*/


function readLocationChemical() {
    d3.json("../data/location_chemical.json", function (error, json) {
        location_chem = json.data;


        for (let c_i = 0; c_i < chemical_list.length; c_i++) {
            maxs[chemical_list[c_i]] = {};
            for (let l_i = 0; l_i < listloc.length; l_i++) {
                let filtered = location_chem.filter(x => x.chem === chemical_list[c_i] && x.loc === listloc[l_i])[0];
                let cc = filtered.values.map(x => x[1])
                maxs[chemical_list[c_i]][listloc[l_i]] = d3.max(cc)
            }
        }
        console.log('maxs', maxs);
    });
}

d3.csv("../data/chemical_list.csv", function (data) {

    data.forEach(function (data) {
        ingredients[index] = data.chemicals;
        offsetYDict[data.chemicals] = index * 100;
        index++;
    });

    for (var i = 0; i < listloc.length; i++) {
        dataloc[listloc[i]] = [];
        loc_ingredients[listloc[i]] = {};

        for (var j = 0; j < ingredients.length; j++) {
            loc_ingredients[listloc[i]][ingredients[j]] = [];
        }
    }
    d3.json("../data/organized.json", function (error, json) {
        json.data.forEach(function (d) {
            dataloc[d.location].push(d)
            for (var i = 0; i < ingredients.length; i++) {
                if (d.hasOwnProperty(ingredients[i])) {
                    temp = parseTime(d.date);
                    if (units['mg/l'].find(function (chem) {
                        return chem == ingredients[i];
                    })) loc_ingredients[d.location][ingredients[i]].push([temp, d[ingredients[i]] * 1000]);
                    else {
                        loc_ingredients[d.location][ingredients[i]].push([temp, d[ingredients[i]]]);
                    }
                    //loc_ingredients[d.location][ingredients[i]].push([temp, d[ingredients[i]]])
                }
            }
        });
    });

});
var interData;
var diffData = {};
var diffDataMerged = [];
var statData = {};
var minMax = [];
d3.json("../data/interpolated/newdata.json", function (error, interdata) {
    d3.json("../data/difference/statistics_final.json", function (error, stats) {
        interData = interdata;
        /*
        date = d3.timeDay.range(new Date(2016,01,01), new Date(2017,1,1));
        var temp = [];
        for(var i in date){
            temp.push(date[i].toISOString().slice(5,10));
        }
        temp.sort();
        var stats = {};
        for(var i in temp){
            stats[temp[i]] = d[i];
        }
        */
        for (var date in interdata) {
            diffData[date] = [];
            for (var i in ingredients) {
                var slicedDate = date.slice(5, 10);
                var locs = Object.keys(interdata[date][ingredients[i]]);
                for (var j = 0; j < locs.length; j++) {
                    var idx = 0;
                    for (var mean in stats[slicedDate][ingredients[i]]) {
                        if (idx == 2) {
                            if (stats[slicedDate][ingredients[i]][mean] == 0) {
                                //       diffData[date].push([ingredients[i], locs[j], interdata[date][ingredients[i]][locs[j]]]);
                            }
                            else {
                                diffData[date].push([ingredients[i], locs[j], interdata[date][ingredients[i]][locs[j]] / stats[slicedDate][ingredients[i]][mean]]);
                            }
                            break;

                        }
                        idx++;
                    }
                }
            }
        }
        /*sort*/
        for (var date in diffData) {
            var items = diffData[date];

            items.sort(function (first, second) {
                return second[2] - first[2];
            });
            if (items[0][0] == 'Total coliforms' || items[0][0] == 'Fecal coliforms' || items[0][0] == 'Fecal streptococci ') {
                for (var i in items) {
                    if (items[i][0] != 'Total coliforms' && items[i][0] != 'Fecal coliforms' && items[i][0] != 'Fecal streptococci ') {
                        var temp = items[0];
                        items[0] = items[i];
                        items[i] = temp;
                    }

                }
            }
            diffData[date] = items;
        }
        var max = -1;
        var min = Infinity;

        var count = 0;
        var weekMax = [0, 0, -1, 0];//chem, loc, val, date
        var debug = [];
        for (var date in diffData) {
            debug.push(diffData[date][0][2]);

            if (weekMax[2] < diffData[date][0][2]) {
                weekMax = diffData[date][0];
                weekMax.push(date);
            }
            if (count == 6) {
                if (weekMax[2] != -1) {
                    if (max < weekMax[2]) max = weekMax[2];
                    if (min > weekMax[2]) min = weekMax[2];
                    if (weekMax[2] > threshold)
                        weekMax[2] = threshold;
                    diffDataMerged.push(weekMax);
                }
                weekMax = [0, 0, -1, 0];
                count = -1;
            }
            count++;
            /*
            var temp = diffData[date][0][2];
            if(max < temp) {
                sssMax = semiSemiMax;
                semiSemiMax = semiMax;
                semiMax = max;
                max = temp;
            }
            if(min > temp) min = temp;
            var addDate = [];
            addDate.push(diffData[date][0][0]);
            addDate.push(diffData[date][0][1]);
            addDate.push(diffData[date][0][2]);
            addDate.push(date);
            diffDataMerged.push(addDate);
            */
            //	console.log(diffDataMerged);
        }
        minMax.push(min);
        minMax.push(max);

        for (var i in ingredients) {
            statData[ingredients[i]] = timeScale(stats, ingredients[i]);
        }
        for (let c_i = 0; c_i < chemical_list.length; c_i++) {
            let c = chemical_list[c_i]
            maxs[c]['max'] = d3.max(statData[c].max.map(x => x[1]))
            maxs[c]['min'] = d3.max(statData[c].min.map(x => x[1]))
            maxs[c]['mean'] = d3.max(statData[c].mean.map(x => x[1]))
            maxs[c]['median'] = d3.max(statData[c].median.map(x => x[1]))
        }
        calRender();
    });
});
let input_container = d3.select('#input-container')
let input_svg = input_container.append('svg').attr('class', 'inputsvg').attr('width', 1000).attr('height', 115);


input_svg.append('g')
    .attr('class', 'input-bg')
    .append('rect')
    .attr('width', 1000)
    .attr('height', 100)
    .style('fill', 'transparent')

let forOnOff = input_svg.append('g')
					.attr('class', 'on-off')
					.attr('transform', 'translate(10, 0)')
forOnOff.append('rect')
				.attr('width', 25)
				.attr('height', 25)
				.attr('stroke', 'black')
				.attr('fill', 'white')
				.attr('stroke-width', '1px')
				.attr('transform', 'translate(0, 50)')
				.attr('onclick', 'showDots()')
				.append('text')
				.attr('text-anchor', 'middle')
				.attr('color', 'black')
				.text('on');
				

forOnOff.append('rect')
		.attr('width', 25)
		.attr('height', 25)
		.attr('stroke', 'black')
		.attr('fill', 'black')
		.attr('stroke-width', '1px')
		.attr('transform', 'translate(25, 50)')
		.attr('onclick', 'hideDots()')
		.append('text')
		.attr('text-anchor', 'middle')
		.attr('color', 'black')
		.text('off');
/*
forOnOff.append("rect")
	.append('text')
	.attr("id", "on")
	.attr('x', 0)
	.attr('y', 0)
	.attr('width', 20)
	.attr('height', 10)
	.on("click", hideDots())
	.text("on");

forOnOff.append("rect")
	.append('text')
	.attr('x', 20)
	.attr('y', 0)
	.attr('width', 20)
	.attr('height', 10)
	.on("click", showDots())
	.text("off");
*/
let input_division = input_svg.append('g').attr('class', 'division');
input_division.append('rect')
    .attr('class', 'loc')
    .attr('width', 685)
    .attr('height', 1)
    .attr('rx', 3)
    .attr('ry', 3)
    .attr('transform', 'translate(15,20)')
    .style('fill', 'black')

input_division.append('text')
    .attr('class', 'loc')
    .attr('x', 351)
    .attr('y', 3)
    .attr('width', 702)
    .attr('height', 16)
    .attr('transform', 'translate(6.5,6)')
    .style('fill', 'black')
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'middle')
    .style('font-weight', 'bold')
    .style('font-size', 15)
    .text('LOCATION')

input_division.append('rect')
    .attr('class', 'stat')
    .attr('width', 257)
    .attr('height', 1)
    .attr('rx', 1)
    .attr('ry', 1)
    .attr('transform', 'translate(726,20)')
    .style('fill', 'black')

input_division.append('text')
    .attr('class', 'stat')
    .attr('x', 140.5)
    .attr('y', 3)
    .attr('width', 281)
    .attr('height', 16)
    .attr('transform', 'translate(713,6)')
    .style('fill', 'black')
    .style('font-size', 15)
    .style('font-weight', 'bold')
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'middle')
    .text('STATISTICS')


let location_buttons = input_svg.append('g').attr('class', 'location_buttons')
let location_button = location_buttons.selectAll('.location_button')
    .data(listloc).enter().append('g')
let stats = ['min', 'max', 'mean', 'median'];
let stat_buttons = input_svg.append('g').attr('class', 'stat_buttons')
let stat_button = stat_buttons.selectAll('.stat_button')
    .data(stats)
    .enter()
    .append('g')
stat_button.append('rect')
    .attr('class', function (d) {
        return 'sbtn sbtn-' + d;
    })
    .attr('width', 60)
    .attr('height', 15)
    .attr('transform', function (d, i) {
        return 'translate(' + (8 + (10 + i) * 71) + ',26)';
    })
    .style('fill', function (d) {
        return 'white'
    })
    .attr('rx', 5)
    .attr('ry', 5)
    .style('stroke', function (d) {
        return colorTrend(d);
    })
    .style('stroke-width', 1)
    .on('click', function (d, i) {
        if (d3.select(this).classed('selected')) {
            d3.select(this).classed('selected', false)
            d3.select(this)
                .style('fill', function () {
                    return 'white';
                })
            d3.select('.stxt-' + d)
                .style('stroke', function (d) {
                    return colorTrend(d);
                })
                .style('fill', function (d) {
                    return colorTrend(d);
                })
        } else {
            d3.select(this).classed('selected', true)
            d3.select(this)
                .style('fill', function () {
                    return colorTrend(d);
                })
            d3.select('.stxt-' + d)
                .style('stroke', function (d) {
                    return 'white';
                })
                .style('fill', function (d) {
                    return 'white';
                })
        }
        update_selected_location(d)
        trend_update(currentDate)
    })
    .on("mouseover", function (d, i) {
        d3.select(this)
            .style('stroke-width', 3)
    })
    .on("mouseout", function (d, i) {
        d3.select(this)
            .style('stroke-width', 1);
    });

stat_button.append('text')
    .attr('x', 0)
    .attr('y', 8)
    .attr('transform', function (d, i) {
        return 'translate(' + (38 + (10 + i) * 71) + ',26)';
    })
    .text(function (d) {
        return d
    })
    .attr('class', function (d) {
        return 'stxt stxt-' + d;
    })
    .style('text-anchor', 'middle')
    .style('stroke', function (d) {
        return colorTrend(d);
    })
    .style('stroke-width', 0.5)
    .style('fill', function (d) {
        return colorTrend(d);
    })
    .style('font-size', 12)
    .style('alignment-baseline', 'middle')
    .on('click', function (d, i) {
        if (d3.select(this).classed('selected')) {
            d3.select(this).classed('selected', false)
            d3.select('.sbtn-' + d)
                .style('fill', function () {
                    return 'white';
                })
            d3.select(this)
                .style('stroke', function (d) {
                    return colorTrend(d);
                })
                .style('fill', function (d) {
                    return colorTrend(d);
                })
        } else {
            d3.select(this).classed('selected', true)
            d3.select('.sbtn-' + d)
                .style('fill', function () {
                    return colorTrend(d);
                })
            d3.select(this)
                .style('stroke', function (d) {
                    return 'white';
                })
                .style('fill', function (d) {
                    return 'white';
                })
        }
        update_selected_location(d)
        trend_update(currentDate)
    })
    .on("mouseover", function (d, i) {

        d3.select('.sbtn-' + d)
        // .style('fill', function (d) {
        //     return colorTrend(d);
        // })
            .style('stroke-width', 3)
    })
    .on("mouseout", function (d, i) {

        d3.select('.sbtn-' + d)

            .style('stroke-width', 1)

    });

location_button.append('rect')
    .attr('class', function (d) {
        return 'lbtn lbtn-' + d;
    })
    .attr('id', function (d) {
        return "btn" + d;
    })
    .attr('width', 60).attr('height', 15)
    .attr('transform', function (d, i) {
        return 'translate(' + (8 + i * 71) + ',26)';
    })
    .attr('rx', 5)
    .attr('ry', 5)
    .style('fill', function (d) {
        return 'white'
    })
    .style('stroke', function (d) {
        return colorTrend(d);
    })
    .style('stroke-width', 1)
    .on('click', function (d, i) {
        if (d3.select(this).classed('selected')) {
            d3.select(this).classed('selected', false)
            d3.select(this)
                .style('fill', function () {
                    return 'white';
                })
            d3.select('.ltxt-' + d)
                .style('stroke', function (d) {
                    return colorTrend(d);
                })
                .style('fill', function (d) {
                    return colorTrend(d);
                })
        } else {
            d3.select(this).classed('selected', true)
            d3.select(this)
                .style('fill', function () {
                    return colorTrend(d);
                })
            d3.select('.ltxt-' + d)
                .style('stroke', function (d) {
                    return 'white';
                })
                .style('fill', function (d) {
                    return 'white';
                })
        }
        update_selected_location(d)
        trend_update(currentDate)
    })
    .on("mouseover", function (d, i) {
        d3.select(this)
            .style('stroke-width', 3)
    })
    .on("mouseout", function (d, i) {
        d3.select(this)
            .style('stroke-width', 1);
    });

location_button.append('text')
    .attr('x', 0)
    .attr('y', 8)
    .attr('class', function (d) {
        return 'ltxt ltxt-' + d;
    })
    .attr('transform', function (d, i) {
        return 'translate(' + (38 + i * 71) + ',26)';
    })
    .text(function (d) {
        return d
    })
    .style('text-anchor', 'middle')
    .style('stroke', function (d) {
        return colorTrend(d);
    })
    .style('fill', function (d) {
        return colorTrend(d);
    })
    .style('stroke-width', 0.5)
    .style('font-size', 12)
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'middle')
    .on('click', function (d, i) {
        if (d3.select(this).classed('selected')) {
            d3.select(this).classed('selected', false)
            d3.select('.lbtn-' + d)
                .style('fill', function () {
                    return 'white';
                })
            d3.select(this)
                .style('stroke', function (d) {
                    return colorTrend(d);
                })
                .style('fill', function (d) {
                    return colorTrend(d);
                })
        } else {
            d3.select(this).classed('selected', true)
            d3.select('.lbtn-' + d)
                .style('fill', function () {
                    return colorTrend(d);
                })
            d3.select(this)
                .style('stroke', function (d) {
                    return 'white';
                })
                .style('fill', function (d) {
                    return 'white';
                })
        }
        update_selected_location(d)
        trend_update(currentDate)
    })
    .on("mouseover", function (d, i) {
        d3.select('.lbtn-' + d)
            .style('stroke-width', 3)
    })
    .on("mouseout", function (d, i) {
        d3.select('.lbtn-' + d)
            .style('stroke-width', 1)

    });


var entireDate;
d3.json("../data/interpolated/date.json", function (error, json) {
    entireDate = json;
});

function calRender() {
//	var cellSize = 890/6930;
    var cellSize = 890 / 990;
    var pointx1 = 0;
    var pointx2 = 0;
    var calColor = d3.scaleQuantize().domain([minMax[0], threshold]).range(["#a50026", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"].reverse());
    var svg = d3.select(".inputsvg");
    var margin = {top: 70, right: 20, bottom: 30, left: 70};
    var width = 980 - margin.left - margin.right;
    var height = 100 - margin.top - margin.bottom;
    var x = d3.scaleTime()
        .rangeRound([0, width])
        .domain([new Date(1998, 0, 11), new Date(2017, 0, 0)]);

    // .style('stroke', 'black')
    // .style('stroke-width', '0');

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top - 20) + ")")
        .attr("width", width)
        .attr("height", height);
    pointx1 = x(new Date(1998, 0, 11));

    var rects = g
        .selectAll('.rectq')
        .data(diffDataMerged)
        .enter()
        .append('g')
        .attr('class', function (d, i) {
            return 'rectq rectg-' + i + " cell"
        });
    var rect = rects.append('rect')
        .attr('date', function (d) {
            return d[3]
        })
        .attr('width', cellSize)
        .attr('height', 25)
        .attr('x', function (d) {
            return pointx1 += cellSize;
        })
        .attr('y', 0)
        .style('fill', function (d) {
            return calColor(d[2])
        })
        .on('click', function (d, i) {
            trend_update(d[3]);

            d3.selectAll(".fixed").remove();
            d3.selectAll('.selected-date').remove();
            d3.select("#trend")
                .append('line')
                .attr('class', 'selected-date')
                .attr('position', 'absolute')
                .attr('z-index', -20)
                .attr('x1', (i * cellSize + 70))
                .attr('y1', 0)
                .attr('x2', (i * cellSize + 70))
                .attr('y2', 10600)
                .attr('stroke', 'red')
				.attr('stroke-dasharray', "5 5");

            var text = d[1] + ",\n" + d[0] + ",\n" + d[3];
            var offset = (i + 1) * cellSize;

            d3.select('.rectg-' + i)
                .append("polygon")
                .attr("class", "fixed")
                .attr("points", offset + ",25 " + (offset - 4) + ",32 " + (offset + 4) + ",32")
                .attr("fill", calColor(d[2]))
                .attr("stroke", "none");

            d3.select('.rectg-' + i)
                .append("rect")
                .attr("class", "fixed")
                .attr('x', -70)
                .attr('y', 32)
                .attr("width", 1000)
                .attr('height', 20)
                .attr("fill", calColor(d[2]))
                .attr("stroke", "none");

            d3.select('.rectg-' + i)
                .append("text")
                .attr("class", "fixed")
                .attr("width", 250)
                .attr('height', 50)
                .attr("stroke", "white")
                .style("text-anchor", "middle")
                .attr("paint-order", "stroke")
                .attr("stroke-width", 3)
                .attr("stroke-opacity", 0.6)
                .attr("stroke-linecap", "butt")
                .attr("stroke-linejoin", "miter")
                .attr("x", 435)
                .attr("y", 47)
                .style('fill', 'black')
                .text(text);

        })
        .on("mouseover", function (d, i) {
            d3.selectAll('.fixed')
                .attr("visibility", 'hidden');

            d3.select(this)
                .attr("stroke", "red")
                .attr("stroke-width", "1");

            d3.select("#trend")
                .append('line')
                .attr('class', 'tooltip-line')
                .attr('position', 'absolute')
                .attr('z-index', -20)
                .attr('x1', (i * cellSize + 70))
                .attr('y1', 0)
                .attr('x2', (i * cellSize + 70))
                .attr('y2', 10600)
                .attr('stroke', 'red')
				.attr('stroke-dasharray', '5 5');
            var text = d[1] + ",\n" + d[0] + ",\n" + d[3];
            var offset = (i + 1) * cellSize;
            d3.select('.rectg-' + i)
                .append("polygon")
                .attr("class", "tooltip-pointer")
                .attr("points", offset + ",25 " + (offset - 4) + ",32 " + (offset + 4) + ",32")
                .attr("z-index", 10)
                .attr("fill", function (d) {
                    return calColor(d[2])
                })
                .attr("stroke", "none");

            d3.select('.rectg-' + i)
                .append("rect")
                .attr("class", "tooltip-bg")
                .attr('x', -70)
                .attr('y', 32)
                .attr("width", 1000)
                .attr('height', 20)
                .attr('z-index', 10)
                .attr("fill", function (d) {
                    return calColor(d[2])
                })
                .attr("stroke", "none");

            d3.select('.rectg-' + i)
                .append("text")
                .attr("class", "tooltip")
                .attr("width", 250)
                .attr('height', 50)
                .attr("stroke", "white")
                .style("text-anchor", "middle")
                .attr("paint-order", "stroke")
                .attr("stroke-width", 3)
                .attr("stroke-opacity", 0.6)
                .attr("stroke-linecap", "butt")
                .attr("stroke-linejoin", "miter")
                .attr("x", 435)
                .attr("y", 47)
                .attr("z-index", 10)
                .style('fill', 'black')
                .text(text);
        })
        .on("mouseout", function (d, i) {
            d3.selectAll('.fixed')
                .attr('visibility', 'visible');
            d3.select(this)
                .attr("stroke", "none")
            d3.selectAll(".tooltip-line").remove();
            d3.selectAll(".tooltip").remove();
            d3.selectAll('.tooltip-bg').remove();
            d3.selectAll(".tooltip-pointer").remove();
        });
    render(chemical_list);
}

function render() {

    // console.log('wooil', chkedLoc, chemOrder);
    //console.log('wooil2', loc_ingredients, statData);
    //console.log('wooil3', location_chem);
    d3.selectAll(".cur-graph").remove();
    d3.select("#trend").selectAll('.axisX').remove();
    d3.select("#trend").selectAll('.axisY').remove();


    var margin = {top: 20, right: 20, bottom: 30, left: 70};
    var width = graphWidth - margin.left - margin.right;
    var height = graphHeight - margin.top - margin.bottom;
    var x = d3.scaleTime().rangeRound([0, width]);
    var y = d3.scaleLinear().rangeRound([height, 0]);
    x.domain([new Date(1998, 0, 11), new Date(2017, 0, 0)]);
    y.domain([0, 100]);
    var line = d3.line()
        .x(function (d) {
            return x(parseTime(d[0]));
        })
        .y(function (d) {
            return y(d[1]);
        });

    let rows = graphsG.selectAll('.row')
        .data(row_orders)
        .enter()
        .append('g')
        .attr('class', function (d, i) {
            return 'row row-chem' + i;
        })
        .attr('transform', function (d, i) {
            return 'translate(' + margin.left + ',' + (30 + graphHeight * i) + ')';
        })


    let xaxis = d3.axisBottom(x).ticks(d3.timeYear.every(1));

    let graph = rows.selectAll('.graph')
        .data(function (d) {
            // console.log(location_chem.filter(x => x.chem === d))
            return location_chem.filter(x => x.chem === d);
        }).enter()
        .append('g')
        .attr('class', function (d, i) {
            // console.log(d)
            return 'graph graph-chem' + chemical_list.indexOf(d.chem) + ' graph-' + d.loc;
        });

    rows.append('g')
        .attr('class', 'axisX')
        .attr('transform', 'translate(0,' + 50 + ')')
        .call(xaxis);

    rows.append("g")
        .attr("class", function (d) {
            return "axisY axisY-chem" + chemical_list.indexOf(d);
        })
        .append("text")
        .attr("fill", "#000")
        .attr("y", -13)
        .attr("dy", "0.5em")
        .attr("text-anchor", "end")
        .text(function (d) {
            var unit = '';
            if (d == 'Macrozoobenthos') {
                return "";
            }
            else {
                if (units['mg/l'].includes(d)) {
                    unit = 'mg/l';
                }
                else if (d == 'Water temperature') {
                    unit = 'C';
                }
                else {
                    unit = '\u00B5' + 'g/l';
                }
            }
            return "(" + unit + ")";
        });

    rows.append("g")
        .append("text")
        .attr('class', 'chem-name')
        .attr('text-anchor', 'middle')
        .attr('x', 440)
        .attr('y', -10)
        .text(function (d) {
            return d;
        });


    let lines_loc = graph
        .selectAll('.line-loc')
        .data(function (d) {
            return [d.values]
        }).enter()
        .append('path')
        .attr('class', function (d, i) {
            return 'line line-loc';
        })
        .attr("fill", "none")
        .attr("stroke", function (d) {
            if (d.length > 0) {
                // console.log('stroke', d);
                // console.log(d[0][2]);
                return colorTrend(d[0][2]);
            }
            else {
                return 'none';

            }
        })
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1)
        .attr('d', function (d) {
            // console.log('d', d);
            if (d.length > 0) {
                let selected = ["Boonsri",
                    "Achara",
                    "Kohsoom",
                    "Busarakhan",
                    "Chai",
                    "Somchair",
                    "Decha",
                    "Tansanee",
                    "Sakda",
                    "Kannika"]
                let arr = [];
                for (let i = 0; i < selected.length; i++) {
                    arr.push(maxs[d[0][3]][selected[i]])
                }
                // console.log('arr', d3.max(arr))
                y.domain([0, d3.max(arr)]);
                let lineGenerator = d3.line()
                    .x(function (d) {
                        return x(parseTime(d[0]))
                    })
                    .y(function (d) {
                        return y(d[1]);
                    })
                return lineGenerator(d)
            }
            else {
                let lineGenerator = d3.line()
                    .x(function (d) {
                        return x(parseTime(d[0]))
                    })
                    .y(function (d) {
                        return y(d[1]);
                    })
                return lineGenerator(d)
            }

        });

    let graph_stat = rows.selectAll('.graph-stat')
        .data(function (d) {
            return [['max', statData[d].max], ['min', statData[d].min], ['mean', statData[d].mean], ['median', statData[d].median]]
        }).enter()
        .append('g')
        .attr('class', function (d, i) {
            // console.log(d)
            return 'graph graph-chem' + chemical_list.indexOf(d.chem) + ' graph-stat graph-' + d[0];
        });
    let lines_stat = graph_stat
        .selectAll('.line')
        .data(function (d) {
            return [d[1]]
        }).enter()
        .append('path')
        .attr('class', function (d, i) {
            return 'line line-stat line-' + d[0][3]
        })
        .attr("fill", "none")
        .attr("stroke", function (d) {
            if (d.length > 0) {
                // console.log('stroke', d);
                // console.log(d[0][2]);
                return colorTrend(d[0][3]);
            }
            else {
                return 'none';

            }
        })
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1)
        .attr('d', function (d) {
            // console.log('stat', d);
            // console.log('d', d);
            if (d.length > 0) {

                let arr = [];

                arr.push(maxs[d[0][2]][d[0][3]])

                // console.log('arr', d3.max(arr))
                y.domain([0, maxs[d[0][2]]['max']]);
                let lineGenerator = d3.line()
                    .x(function (d) {
                        return x(d[0])
                    })
                    .y(function (d) {
                        return y(d[1]);
                    })
                return lineGenerator(d)
            }
            else {
                let lineGenerator = d3.line()
                    .x(function (d) {
                        return x(d[0])
                    })
                    .y(function (d) {
                        return y(d[1]);
                    })
                return lineGenerator(d)
            }
        });
    let dots = graph.append('g').attr('class', 'dots');

    let dot = dots.selectAll(".dot")
        .data(function (d) {
            return d.values
        })
        .enter().append("circle")
        .attr("class", "dot")
        .attr("fill", "transparent")
        .attr("stroke", function (d) {
            return colorTrend(d[2])
        })
        .attr("stroke-width", "1px")
        .attr("cx", line.x())
        .attr("cy", function (d) {
            if (d.length > 0) {
                let selected = ["Boonsri",
                    "Achara",
                    "Kohsoom",
                    "Busarakhan",
                    "Chai",
                    "Somchair",
                    "Decha",
                    "Tansanee",
                    "Sakda",
                    "Kannika"]
                let arr = [];
                for (let i = 0; i < selected.length; i++) {
                    arr.push(maxs[d[3]][selected[i]])
                }
                // console.log('arr', d3.max(arr))
                y.domain([0, d3.max(arr)]);
                return y(d[1])
            }
            else {
                return y(d[1])
            }
        })
        .attr("r", 2.5)
        /*
            .attr("onclick", function (d) {
                return "getInfoFromDot('" + d[2] + "','" + d[3] + "')";
            })
            */
        .attr("onclick", function (d) {
            return "callAddPointInfoDot('" + d[2] + "','" + d[3] + "','" + d[0] + "')";
        });
    axisUpdateInit();
}

// 처음엔 render, 그담부터는 이함수 호출하
function trend_update(date) {
    currentDate = date;
    //console.log(currentDate);
    if (currentDate !== 0) {
        trendToPie();
        update_piechart();
    }

    // console.log('wooil', chkedLoc, chemOrder);

    d3.selectAll(".cur-graph").remove();

    var graphHeight = 100;
    var graphWidth = 980;
    var svg = d3.select("#trend")
        .attr('height', function () {
            return graphHeight * 106;
        });
    console.log('svg', svg)
    var margin = {top: 20, right: 20, bottom: 30, left: 70};
    var width = graphWidth - margin.left - margin.right;
    var height = graphHeight - margin.top - margin.bottom;
    var x = d3.scaleTime().rangeRound([0, width]);
    var y = d3.scaleLinear().rangeRound([height, 0]);
    x.domain([new Date(1998, 0, 11), new Date(2017, 0, 0)]);
    y.domain([0, 100]);
    var line = d3.line()
        .x(function (d) {
            return x(parseTime(d[0]));
        })
        .y(function (d) {
            return y(d[1]);
        });

    let graphsG = svg.selectAll('.graphs');
    // console.log(graphsG)
    // console.log(graphsG.selectAll('.row'))
    // graphsG.selectAll('.row').remove()

    console.log(selected_location)
    let rows = d3.selectAll('.graphs')
        .selectAll('.row')
        .data(function (d) {
            // console.log('row_orders', row_orders)
            return row_orders
        })
        .enter()
        .append('g')
        .attr('class', function (d, i) {
            console.log('row' + i, d)
            return 'row row-chem' + i;
        })
        .attr('transform', function (d, i) {
            var offset = graphHeight * i + 30;
            //console.log(offset);
            return 'translate(' + margin.left + ',' + (margin.top + offset) + ')';
        });
    // console.log('rows', d3.selectAll('.graphs').selectAll('.row'))

    let xaxis = d3.axisBottom(x).ticks(d3.timeYear.every(1));
    // console.log(d3.selectAll('.row').selectAll('.graph'))
    let graph = d3.selectAll('.row').selectAll('.graph')
        .data(function (d) {
            // console.log('graphdata', d)
            return location_chem.filter(x => x.chem === d);
        }).enter()
        .append('g')
        .attr('class', function (d, i) {
            // console.log(d)
            return 'graph graph-chem' + chemical_list.indexOf(d.chem) + ' graph-' + d.loc;
        });
    // console.log(d3.selectAll('.row').selectAll('.graph'))
    // console.log(graph);
    // let dots = d3.selectAll('.graph').select('.dots');
    // dots.selectAll('.dot')
    //     .attr("cy", function (d) {
    //         if (d.length > 0) {
    //             let arr = [];
    //             for (let i = 0; i < selected_location.length; i++) {
    //                 if (maxs[d[3]][selected_location[i]] != undefined)
    //                     arr.push(maxs[d[3]][selected_location[i]])
    //             }
    //             if (arr.length > 0)
    //                 y.domain([0, d3.max(arr)]);
    //             else
    //                 y.domain([0, 0]);
    //             return y(d[1])
    //         }
    //         else {
    //             return y(-1)
    //         }
    //     })
    for (let l_i = 0; l_i < selected_stats.length; l_i++) {

        d3.selectAll('.graph-' + selected_stats[l_i])
            .selectAll('.line-stat')
            .attr('d', function (d) {
                // console.log('stat', d);
                // console.log('d', d);
                if (d.length > 0) {
                    let arr = [];
                    arr.push(maxs[d[0][2]][d[0][3]])
                    // console.log('arr', d3.max(arr))
                    y.domain([0, maxs[d[0][2]]['max']]);
                    let lineGenerator = d3.line()
                        .x(function (d) {
                            return x(d[0])
                        })
                        .y(function (d) {
                            return y(d[1]);
                        })
                    return lineGenerator(d)
                }
                else {
                    let lineGenerator = d3.line()
                        .x(function (d) {
                            return x(d[0])
                        })
                        .y(function (d) {
                            return y(d[1]);
                        })
                    return lineGenerator(d)
                }

            });
    }
    for (let l_i = 0; l_i < selected_location.length; l_i++) {
        d3.selectAll('.graph-' + selected_location[l_i])
            .select('.dots').selectAll('.dot')
            .attr("cy", function (d) {
                if (d.length > 0) {
                    let arr = [];
                    for (let i = 0; i < selected_location.length; i++) {
                        if (maxs[d[3]][selected_location[i]] != undefined)
                            arr.push(maxs[d[3]][selected_location[i]])
                    }
                    if (arr.length > 0)
                        y.domain([0, d3.max(arr)]);
                    else
                        y.domain([0, 0]);
                    return y(d[1])
                }
                else {
                    return y(-1)
                }
            })
        d3.selectAll('.graph-' + selected_location[l_i])
            .selectAll('.line-loc')
            .attr('d', function (d) {
                // console.log('d', d);
                if (d.length > 0) {

                    let arr = [];
                    for (let i = 0; i < selected_location.length; i++) {
                        if (maxs[d[0][3]][selected_location[i]] != undefined)
                            arr.push(maxs[d[0][3]][selected_location[i]])
                    }
                    // console.log('arr', d3.max(arr))
                    if (arr.length > 0) {
                        y.domain([0, d3.max(arr)]);
                    }
                    else {
                        y.domain([0, 0])
                    }
                    let lineGenerator = d3.line()
                        .x(function (d) {
                            return x(parseTime(d[0]))
                        })
                        .y(function (d) {
                            return y(d[1]);
                        })
                    return lineGenerator(d)
                }
                else {
                    let lineGenerator = d3.line()
                        .x(function (d) {
                            return x(parseTime(d[0]))
                        })
                        .y(function (d) {
                            return y(d[1]);
                        })
                    return lineGenerator(d)
                }

            });
    }


    lineUpdate();
    axisUpdate();
    update_rows_order();

}

function axisUpdate() {
    for (let c_i = 0; c_i < chemical_list.length; c_i++) {
        let axisY = d3.select('.axisY-chem' + c_i)


        let arr = [];
        for (let i = 0; i < selected_location.length; i++) {
            arr.push(maxs[chemical_list[c_i]][selected_location[i]])
        }
        for (let i = 0; i < selected_stats.length; i++) {
            arr.push(maxs[chemical_list[c_i]][selected_stats[i]])
        }
        // console.log('arr', d3.max(arr))
        let y = d3.scaleLinear().rangeRound([50, 0]);
        y.domain([0, d3.max(arr)]);
        axisY.call(d3.axisLeft(y).ticks(3))
    }
}

function axisUpdateInit() {
    for (let c_i = 0; c_i < chemical_list.length; c_i++) {
        let axisY = d3.select('.axisY-chem' + c_i)


        let arr = [];
        for (let i = 0; i < listloc.length; i++) {
            arr.push(maxs[chemical_list[c_i]][listloc[i]])
        }
        for (let i = 0; i < selected_stats.length; i++) {
            arr.push(maxs[chemical_list[c_i]][selected_stats[i]])
        }
        // console.log('arr', d3.max(arr))
        let y = d3.scaleLinear().rangeRound([50, 0]);
        y.domain([0, d3.max(arr)]);
        axisY.call(d3.axisLeft(y).ticks(3))
    }
}

function lineUpdate() {

    d3.selectAll('.graph').selectAll('.line').classed('invisible', true)
    d3.selectAll('.graph').selectAll('.dot').classed('invisible', true)
    for (let l_i = 0; l_i < selected_location.length; l_i++) {
        d3.selectAll('.graph-' + selected_location[l_i]).selectAll('.line').classed('invisible', false)
        d3.selectAll('.graph-' + selected_location[l_i]).select('.dots').selectAll('.dot').classed('invisible', false)
    }

    for (let s_i = 0; s_i < selected_stats.length; s_i++) {
        d3.selectAll('.graph-' + selected_stats[s_i]).selectAll('.line').classed('invisible', false)
    }

}

function update_rows_order() {
    row_orders = [];


    if (currentDate == 0)
        row_orders = chemical_list;
    else {
        var chemSet = new Set();
        for (var i in diffData[currentDate]) {
            if (selected_location.includes(diffData[currentDate][i][1])) {
                chemSet.add(diffData[currentDate][i][0]);
            }
        }
        for (var i in chemical_list) {
            chemSet.add(chemical_list[i]);
        }
        for (let chem of chemSet) {
            row_orders.push(chem);
        }

    }

    for (let r_i = 0; r_i < row_orders.length; r_i++) {
        d3.select('.row-chem' + chemical_list.indexOf(row_orders[r_i])).transition().duration(750).attr('transform', function () {
            return 'translate(70,' + (30 + 100 * r_i) + ')'
        })
    }
}

/*
function findAnomaly(date) {
    currentDate = date;
    var chemSet = new Set();
    for (var i in diffData[date]) {
        chemSet.add(diffData[date][i][0]);
    }
    for (var i in ingredients) {
        chemSet.add(ingredients[i]);
    }
    var chemOrder = [];
    for (let chem of chemSet) {
        chemOrder.push(chem);
    }

    var chkedLoc = [];
    for (var i in listloc) {
        if (document.getElementById(listloc[i]).checked == true)
            chkedLoc.push(listloc[i]);
    }

    labelRender(chkedLoc);
    render(chkedLoc, chemOrder);
}
*/
function update_selected_location(location) {
    if (listloc.indexOf(location) > -1) {
        var index = selected_location.indexOf(location);
        if (index > -1) {
            selected_location.splice(index, 1);
        } else {
            selected_location.push(location);
        }
        //console.log(location);
    }
    else {
        var index = selected_stats.indexOf(location);
        if (index > -1) {
            selected_stats.splice(index, 1);
        } else {
            selected_stats.push(location);
        }
        //console.log(location);
    }
    d3.selectAll('.lbtn').classed('selected', false)
    d3.selectAll('.ltxt').classed('selected', false)
    d3.selectAll('.sbtn').classed('selected', false)
    d3.selectAll('.stxt').classed('selected', false)
    for (let s_i = 0; s_i < selected_location.length; s_i++) {
        d3.select('.lbtn-'+selected_location[s_i]).classed('selected', true)
        d3.select('.ltxt-'+selected_location[s_i]).classed('selected', true)
    }
    for (let s_i = 0; s_i < selected_stats.length; s_i++) {
        d3.select('.sbtn-'+selected_stats[s_i]).classed('selected', true)
        d3.select('.stxt-'+selected_location[s_i]).classed('selected', true)
    }
}

function timeScale(avgdata, chem) {
    /*
       var start = d3.min(data, function (d) {
        return d[0]
    });
    var end = d3.max(data, function (d) {
        return d[0]
    });
    */
    date = d3.timeDay.range(new Date(1998, 0, 11), new Date(2016, 11, 32));

    var newdata = {"max": [], "min": [], "mean": [], "median": []};
    for (var i = 0; i < date.length; i++) {
        var slicedDate = date[i].toISOString().slice(5, 10);
        for (var stat in    avgdata[slicedDate][chem]) {
            newdata[stat].push([date[i], avgdata[slicedDate][chem][stat], chem, stat]);
        }
    }
    return newdata;

}

function avgShow(stat) {
    var stats = ["mean", "max", "min", "median"];
    var idx = stats.findIndex(function (d) {
        return d == stat;
    });
    d3.selectAll('.' + stats[idx]).attr("visibility", "visible");
    d3.selectAll('.' + stats[(idx + 1) % 4]).attr("visibility", "hidden");
    d3.selectAll('.' + stats[(idx + 2) % 4]).attr("visibility", "hidden");
    d3.selectAll('.' + stats[(idx + 3) % 4]).attr("visibility", "hidden");

    return;
}

function hideAll() {
    var stats = ["mean", "max", "min", "median"];

    d3.selectAll('.' + stats[0]).attr("visibility", "hidden");
    d3.selectAll('.' + stats[1]).attr("visibility", "hidden");
    d3.selectAll('.' + stats[2]).attr("visibility", "hidden");
    d3.selectAll('.' + stats[3]).attr("visibility", "hidden");
    return;
}

function removeAll() {
    d3.selectAll('g').remove();
    calRender();
    return;
}


function trendToPie() {
	console.log(interData[currentDate]);
    clickcal = [];
    //console.log(signalList);
    //console.log(categoryList);
    delete categoryList['Signal'];
    var temp = {};
    for (var i in categoryList) {
        temp[i] = [];
        for (var q in listloc) {
            var temp_loc = {};
            temp_loc['date'] = currentDate;
            temp_loc['location'] = listloc[q];
            if (typeof(interData[currentDate]['Water temperature'][listloc[q]]) == "undefined")
                temp_loc['Water temperature'] = 0;
            else
                temp_loc['Water temperature'] = interData[currentDate]['Water temperature'][listloc[q]];

            var temp_value = {};
            for (var j in categoryList[i]) {
                temp_value[j] = {};
                for (var k in categoryList[i][j]) {
                    if (categoryList[i][j][k] != 'Water temperature'
                        && chemical_list.includes(categoryList[i][j][k])) {
                        if (typeof(interData[currentDate][categoryList[i][j][k]]) == "undefined"
                            || typeof(interData[currentDate][categoryList[i][j][k]][listloc[q]]) == "undefined") {
                            temp_value[j][categoryList[i][j][k]] = 0;
                        }
                        else {
                            temp_value[j][categoryList[i][j][k]] = interData[currentDate][categoryList[i][j][k]][listloc[q]];
                        }

                    }
                }
            }
            temp_loc['value'] = temp_value;
            temp_loc['category'] = i;
            clickcal.push(temp_loc);
        }
    }

    var temp2 = {};
    for (var i in signalList) {
        temp2[i] = [];
        for (var q in listloc) {
            var temp_loc = {};
            temp_loc['date'] = currentDate;
            temp_loc['location'] = listloc[q];
            if (typeof(interData[currentDate]['Water temperature'][listloc[q]]) == "undefined")
                temp_loc['Water temperature'] = 0;
            else
                temp_loc['Water temperature'] = interData[currentDate]['Water temperature'][listloc[q]];
            var temp_value = {};
            for (var j in signalList[i]) {
                temp_value[j] = {};
                for (var k in signalList[i][j]) {
                    temp_value[j][k] = {};
                    for (var r in signalList[i][j][k]) {
                        if (signalList[i][j][k][r] != 'Water temperature'
                            && chemical_list.includes(signalList[i][j][k][r])) {
                            if (typeof(interData[currentDate][signalList[i][j][k][r]]) == "undefined"
                                || typeof(interData[currentDate][signalList[i][j][k][r]][listloc[q]]) == "undefined") {
                                temp_value[j][k][signalList[i][j][k][r]] = 0;
                            }
                            else {
                                temp_value[j][k][signalList[i][j][k][r]] = interData[currentDate][signalList[i][j][k][r]][listloc[q]];
                            }
                        }
                    }
                }
            }
            temp_loc['value'] = temp_value;
            temp_loc['category'] = i;
            clickcal.push(temp_loc);
        }
    }
    //console.log(clickcal);
}


function getInfoFromDot(loc, chem) {
    clickdot = [loc, chem];
    //console.log(clickdot);
}

function callAddPointInfoDot(loc, chem, date) {
    getInfoFromDot(loc, chem);
    //var param = "{'loc': '"+d[2]+"', 'time': '" + d[0] + "', 'ingredient': '" + d[3] + "'}";
    var param = {};
    param['loc'] = loc;
    param['time'] = date;
    param['ingredient'] = chem;
    addPoint(param);
}

function hideDots(){
	d3.selectAll('.dots').attr('visibility', 'hidden');
	console.log("hi");
}
function showDots(){
	d3.selectAll('.dots').attr('visibility', 'visible');
	console.log("hello");
}
