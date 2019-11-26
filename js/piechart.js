//for design structure
var svg = d3.select("svg#piechart").attr("width", 480).attr("height", 480);
var margin = {top: 0, left: 0, right: 0, bottom: 0};
var width = +svg.attr("width") - margin.left - margin.right;
var height = +svg.attr("height") - margin.bottom - margin.top;
var tsvg = d3.select("svg#cluster").attr("width", 340).attr("height", (2000));
var tmargin = {top: 80, top2:200, left: 30, right: 10, bottom: 10, letter: 20, element: 85, value: 150, ghs: 100, sigtop: 30};
var twidth = +tsvg.attr("width");
var theight = +tsvg.attr("height");
var pixel = {
    'Decha': [40, 296],
    'Tansanee': [148, 348],
    'Somchair': [149, 223],
    'Achara': [200, 155],
    'Sakda': [265, 451],
    'Boonsri': [267, 73],
    'Chai': [310, 235],
    'Kannika': [337, 365],
    'Busarakhan': [382, 200],
    'Kohsoom': [383, 145]
};

//for click event
var change = 0;

//for pie chart
var outer = 41;
var inner = 31;
var categoryouter = 30;
var categoryinner = 20;
var thirdouter = 52;
var thirdinner = 42;
var arc = d3.arc().startAngle(function (d) {
    if (d[3] == 0) return d[0];
    return d[0] + 0.01;
})
    .endAngle(function (d) {
        if (d[3] == 0) return d[1];
        return d[1] - 0.01;
    })
    .innerRadius(function (d) {
        if (d[3] == 0) return categoryinner;
        if (d[3] == 1) return inner;
        return thirdinner;
    })
    .outerRadius(function (d) {
        if (d[3] == 0) return categoryouter;
        if (d[3] == 1) return outer;
        return thirdouter;
    });
//for hierarchy pie chart
var valuelist = []; // fortest
var resultlist = [] // real

//for button
var butwidth = 340 / 4;
var butheight = 20;
var buttonlist = ["GHS02", "GHS05", "GHS06", "GHS07", "GHS08", "GHS09"];

//for tooltip explanation
var tooltiplist = ['for fire hazards','for corrosive damage to metals, as well as skin, eyes','can cause death or toxicity with short exposure to small amounts','may cause less serious health effects or damage the ozone layer','may cause or suspected of causing serious health effects','may cause damage to the aquatic environment'];

//for checkbox drawing
init();

//for making hierarchy pie chart
function update_piechart() {
    //0. erase whole piecharts that were drawn before
    //1. making a hierarchy arc group
    //2. drawing to the map

    //0. erase whole piecharts that were drawn before
    svg.selectAll(".forpiechart").remove();

    //1. making hierarchy
    //making arcs

    var resultlist = [];
    var vlist = []; // for test
    for (var i = 0; i < clickcal.length; i++) {
        var pushlist = [];
        pushlist = category_parse(clickcal[i].value, 0, 0, 2 * Math.PI, clickcal[i].location, clickcal[i].category);
        //console.log(pushlist)
        vlist.push(pushlist);
    }
    //divide with location
    for (var i = 0; i < Object.keys(pixel).length; i++) {
        var list = [];
        var now = Object.keys(pixel)[i];
        for (var j = 0; j < vlist.length; j++) {
            if (vlist[j][0][5] == now)
                list.push(vlist[j])
        }
        resultlist.push(list);
    }

    console.log(resultlist);

    //2.drawing piechart
    var color = d3.scaleOrdinal(d3.schemeCategory20);
    var arcs = d3.pie().value(function (d) {
        return d.value;
    });
    var g = svg.append("g")
        .attr("class", "forpiechart");

    //water?

    var pielocg = g.selectAll("g.pielocchart")
        .data(resultlist) //여기서 d는 각각의 location이다.
        .enter()
        .append("g")
        .attr("class", "pielocchart")
        .attr("id",function(d,i){
                return Object.keys(pixel)[i];
              })
        .attr("transform", function (d, i) {
            //console.log(d.location);
            return "translate(" + (pixel[Object.keys(pixel)[i]][0] + margin.left) + "," + (pixel[Object.keys(pixel)[i]][1] + margin.top) + ")";
        });

    var insideblur = pielocg.append("circle")
                            .attr("id","forinsideblur")
                            .attr("r",categoryinner -1)
                            .attr("fill","#ffffff")
                            .attr("opacity",0.6);
                            //.attr("visibility","hidden");

    var piecatg = pielocg.selectAll("g.piecatchart")
        .data(function (d) {
            return d;
        }) //여기서 d는 각각의 category이다.
        .enter()
        .append("g")
        .attr("class", "piecatchart")
        .attr("id", function (d, i) {
            switch (i) {
                case 0:
                    return "Metal";
                case 1:
                    return "IARC";
                case 2:
                    return "POPs";
                case 3:
                    return "ECHA";
                case 4:
                    return "NITE-CMC";
                case 5:
                    return "EUREG";
            }
        })
        .attr("visibility", "hidden");

    var centertext = piecatg.append("text")
        .attr("class", "centertext")
        .attr("id", "first")
        .attr("transform", "translate(0,-10)")
        .text("center")
        .style("font-weight", "bold")
        .style("font-size", "4px")
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "middle");

    var centertext2 = piecatg.append("text")
        .attr("class", "centertext")
        .attr("id", "second")
        .attr("transform", "translate(0,0)")
        .text("center")
        .style("font-weight", "bold")
        .style("font-size", "4px")
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "middle");

    var piearcg = piecatg.selectAll("g.arcs")
        .data(function (d) {
            return d;
        }) //여기서 d는 각각의 arc list이다.
        .enter()
        .append("g")
        .attr("class", "arcs");

    var arcs = piearcg.append("path")
        .attr("d", arc)
        .attr("id",function(d){return d[2].replace(/(\s*)/g,"").replace('(',"").replace(')',"");})
        .style("fill", function (d, i) {
            return color(d[2])
        });


    //hide the other piecharts
    pielocg.selectAll("g#ECHA").attr("visibility", "visible");


    //3.event handler
    //also we have to choose right
    //for shadow effect
    // var filter = svg.append("defs")
    //     .append("filter")
    //     .attr("id", 'drop-shadow')
    //     .attr("height", "130%");
    //
    // filter.append("feGaussianBlur")
    //     .attr("in", "SourceAlpha")
    //     .attr("stdDeviation", 5)
    //     .attr("result", "blur");
    //
    // filter.append("feOffset")
    //     .attr("in", "blur")
    //     .attr("dx", 5)
    //     .attr("dy", 5)
    //     .attr("result", "offsetBlur");
    //
    // var feMerge = filter.append("feMerge");
    // feMerge.append("feMergeNode")
    //     .attr("in", "offsetBlur")
    // feMerge.append("feMergeNode")
    //     .attr("in", "SourceGraphic")

    //mouse click
    pielocg.on("click", onClick);
    piearcg.on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);
}


function category_parse(data, level, start_deg, stop_deg, location, category) {
    //console.log(data);
    var total = 0;
    var list = [];
    var count;
    if (category == "IARC" || category == "Metal" || category == "POPs") count = 1;
    else count = 2;

    for (var key in data) {
        total += count_function(data[key], count);
        //console.log(count_function(data[key]));
    }

    var start_angle = start_deg;
    var stop_angle = start_deg;
    var start_angle2 = start_deg;
    var stop_angle2 = start_deg;
    var start_angle3 = start_deg;
    var stop_angle3 = start_deg;

    //if(total == 0){ return no data!};
    if (category == "IARC" || category == "Metal" || category == "POPs") {
        for (var key in data) { //first hierarchy
            //category divider
            start_angle = stop_angle;
            var inc_deg = 0;
            if (total == 0) inc_deg = 0;
            else inc_deg = (stop_deg - start_deg) / total * count_function(data[key], 1);
            stop_angle = start_angle + inc_deg;
            name = key;
            //data change
            var datalist = [];
            datalist.push(data[key]);
            datalist = datalist.map(function (d) {
                return d3.entries(d)
            });
            //console.log([start_angle, stop_angle,name,level,datalist[0],location]);
            list.push([start_angle, stop_angle, name, level, count_function(data[key], 1), location, category]);
            for (var skey in data[key]) {  //second hierarchy
                //console.log();
                start_angle2 = stop_angle2;
                var inc_deg2 = 0;
                if (total == 0) inc_deg2 = 0
                else inc_deg2 = (stop_deg - start_deg) / total * data[key][skey];
                stop_angle2 = start_angle2 + inc_deg2;
                name = skey;
                //data change
                list.push([start_angle2, stop_angle2, name, level + 1, data[key][skey], location, category]);
                //console.log([start_angle2, stop_angle2, name, level + 1, data[key][skey], location]);
            }
        }
    }
    else {
        for (var key in data) { //first hierarchy
            //category divider
            start_angle = stop_angle;
            var inc_deg = 0;
            if (total == 0) inc_deg = 0;
            else inc_deg = (stop_deg - start_deg) / total * count_function(data[key], 2);
            stop_angle = start_angle + inc_deg;
            name = key;
            //data change
            var datalist = [];
            datalist.push(data[key]);
            datalist = datalist.map(function (d) {
                return d3.entries(d)
            });
            //console.log([start_angle, stop_angle,name,level,datalist[0],location]);
            list.push([start_angle, stop_angle, name, level, count_function(data[key], 2), location, category]);
            for (var skey in data[key]) {  //second hierarchy
                //console.log();
                start_angle2 = stop_angle2;
                if (skey == "name") {
                    start_angle3 = start_angle2;
                    stop_angle3 = start_angle2;
                    for (var tkey in data[key][skey]) {
                        start_angle3 = stop_angle3;
                        var inc_deg3 = 0;
                        if (total == 0) inc_deg3 = 0
                        else inc_deg3 = (stop_deg - start_deg) / total * data[key][skey][tkey];
                        stop_angle3 = start_angle3 + inc_deg3;
                        name = tkey;
                        //data change
                        list.push([start_angle3, stop_angle3, name, level + 1, data[key][skey][tkey], location, category]);
                    }
                    continue;
                }
                var inc_deg2 = 0;
                if (total == 0) inc_deg2 = 0
                else inc_deg2 = (stop_deg - start_deg) / total * count_function(data[key][skey], 1);
                stop_angle2 = start_angle2 + inc_deg2;
                name = skey;
                //data change
                list.push([start_angle2, stop_angle2, name, level + 1, count_function(data[key][skey], 1), location, category]);
                //console.log([start_angle2, stop_angle2, name, level + 1, data[key][skey], location]);
                for (var tkey in data[key][skey]) {
                    start_angle3 = stop_angle3;
                    var inc_deg3 = 0;
                    if (total == 0) inc_deg3 = 0
                    else inc_deg3 = (stop_deg - start_deg) / total * data[key][skey][tkey];
                    stop_angle3 = start_angle3 + inc_deg3;
                    name = tkey;
                    //data change
                    list.push([start_angle3, stop_angle3, name, level + 2, data[key][skey][tkey], location, category]);
                }
            }
        }
    }
    return list;
}

function count_function(data, count) { //data는 values가 들어옴
    //console.log(data);
    var list = [];
    list.push(data);
    list = list.map(function (d) {
        return d3.entries(d)
    });
    switch (count) {
        case 1:
            //console.log(list);
            var sum = 0;
            for (var i = 0; i < list[0].length; i++) {
                //console.log(list[0]);
                sum += list[0][i].value;
                //console.log(list[0][i].value);
            }
            break;
        case 2:
            var sum = 0;
            for (var i = 0; i < list[0].length; i++) {
                sum += count_function(list[0][i].value, 1);
            }
            //console.log(sum);
            break;
    }
    return sum;
}


d3.selection.prototype.bringElementAsTopLayer = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};


var textclick = 0;
var bigcolor = ["#FFF050", "#B0F566", "#AFFAFF", "#117857"];
var categorylist = ['Signal', 'Metal', 'IARC', 'POPs'];

function onClick(piedata) {
    console.log(piedata);
    d3.select(this).bringElementAsTopLayer();
    var pie = d3.select(this);
    var transform = pie.attr("transform");
    if (change === 0) {
        //console.log("hi" + transform);
        pie.transition().attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ") scale(3)").duration(1000);
        svg.selectAll("#forinsideblur").attr('visibility',"visible");
        change = 1;
      /*  var text = pie.selectAll(".arcs")
            .append("text")
            .text(function (d) {
                if (d[4] >= 8 && d[3] == 1) return d[2]
            })
            .attr("text-anchor", "middle")
            .attr("x", function (d) {
                var a = d[0] + (d[1] - d[0]) / 2 - Math.PI / 2;
                d.cx = Math.cos(a) * (inner - 10);
                return d.x = Math.cos(a) * (inner + 25);
            })
            .attr("y", function (d, i) {
                var a = d[0] + (d[1] - d[0]) / 2 - Math.PI / 2;
                d.cy = Math.sin(a) * (inner - 10);
                return d.y = Math.sin(a) * (inner + 25);
            })
            .attr("stroke", "#cfe0e7")
            .attr("paint-order", "stroke")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.6)
            .attr("stroke-linecap", "butt")
            .attr("stroke-linejoin", "miter")
            .style("font-size", "4px")
            .style("font-weight", "bold");*/

        //have to fix
        svg.selectAll(".temperature")
            .attr("stroke", "#cfe0e7")
            .attr("paint-order", "stroke")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.6)
            .attr("stroke-linecap", "butt")
            .attr("stroke-linejoin", "miter")
            .style("font-size", "8px")
            .style("font-weight", "bold");
        //console.log(change);

        //we have to draw a new table in tsvg
        //init_table(piedata);

        console.log("hi");
        var buttonspace = tsvg.append("g")
            .attr("class", "buttonspace")
            .attr("transform", "translate(" + 0 + "," + 0 + ")");

        var bigcategory = buttonspace.selectAll(".bigcat")
            .data(categorylist)
            .enter()
            .append('g')
            .attr('class', 'bigcat')
            .style("cursor", "pointer");

        bigcategory.append("rect")
            .attr("id", function (d, i) {
                return "bigcat" + i
            })
            .attr("width", butwidth)
            .attr("height", butheight + 10)
            .attr("x", function (d, i) {
                return i * butwidth
            })
            .attr("y", 5)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("fill", function (d, i) {
                return bigcolor[i];
            });

        bigcategory.append("text")
            .attr("id", function (d, i) {
                return "bigcat" + i
            })
            .text(function (d) {
                return d;
            })
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("x", function (d, i) {
                return i * butwidth + butwidth / 2
            })
            .attr("y", butheight / 2 + 5)
            .attr("fill", "black")
            .style("font-weight", "bold");

        buttonspace.select('.bridge').remove();
        let bridge = buttonspace.append('g')
            .attr('class', 'bridge')

        bridge.append('rect')
            .attr('class', 'bridgerect')
            .attr('width', 340)
            .attr('height', 20)
            .attr('fill', function () {
                return bigcolor[0];
            })
            .attr('transform', 'translate(0,22)')

        bigcategory.on("click", function (d, i) {
            tsvg.selectAll("g.category").remove();
            var id = "bigcat" + i;
            var text = d3.select(this).selectAll("text#" + id).text();
            d3.select('.bridgerect')
                .style('fill', function () {
                    console.log(d, i, d3.select(this).select('text'))
                    return bigcolor[i];
                });
            drawButton(text, buttonspace, categorylist, piedata);
            //changecategory
            if (d3.select(this).text() != "Signal") {
                var tochange = d3.select(this).selectAll("text").text();
                var hidden = d3.selectAll(".pielocchart").selectAll(".piecatchart").attr("visibility", "hidden");
                var visible = d3.selectAll(".pielocchart").selectAll("g#" + tochange).attr("visibility", "visible");
            }

        });
    }
    else {
        console.log(d3.select(this).attr("id"));
        var id = d3.select(this).attr("id");
        pie.transition().attr("transform", "translate(" + (pixel[id][0]) + "," + (pixel[id][1]) + ")").duration(500);
        //svg.selectAll("#forinsideblur").attr('visibility',"hidden");
        d3.select("svg#cluster").selectAll("*").remove();
        change = 0;
    }

}

function drawButton(text, buttonspace, categorylist, piedata) {
    var defaultbcolor = bigcolor[categorylist.indexOf(text)];
    var pressedbcolor = "white";
    var hoverbcolor = "#dddf36";

    d3.json("../data/category/category_" + text + ".json", function (error, data) {
        console.log(text);
        switch (text) {
            case categorylist[0]:
                buttonspace.selectAll(".subbut").remove();
                var updateclick = [10, 10]; //get what elements are clicked
                console.log(d3.entries(data));

                var subbuttonspace = buttonspace.append('g')
                    .attr('class', 'subbut');

                var ghsbutton = subbuttonspace.selectAll("g.ghsbut")
                    .data(buttonlist)
                    .enter()
                    .append("g")
                    .attr("class", "ghsbut")
                    .style("cursor", "pointer");

                ghsbutton.append("svg:image")
                    .attr("class", "ghsbutimg")
                    .attr("id", function (d, i) {
                        return d;
                    })
                    .attr("xlink:href", function (d) {
                        return "../data/category/" + d + ".svg"
                    })
                    .attr("width", butwidth * 4 / 6)
                    .attr("height", butwidth * 4 / 6)
                    .attr("x", function (d, i) {
                        return i * (butwidth * 4 / 6)
                    })
                    .attr("y", 80);

                var tooltip = subbuttonspace.selectAll('.tooltip')
                                            .data(tooltiplist)
                                            .enter()
                                            .append('g')
                                            .attr('class','tooltip')
                                            .attr('id',function(d,i){return "tooltip"+buttonlist[i];})
                                            .attr("visibility","hidden")
                                            .append("text")
                                            .style("position", "absolute").style("z-index", 100)
                                            .text(function(d){return d;});

                var signalbuttong = subbuttonspace.selectAll("g.sigbutg")
                    .data(d3.entries(data))
                    .enter()
                    .append("g")
                    .attr("class", "sigbutg")
                    .style("cursor", "pointer")
                    .attr("transform", "translate(0," + 30 + ")");

                var signalbutton = signalbuttong.append("rect")
                    .attr("id", function (d, i) {
                        return "sig" + i
                    })
                    .attr("width", butwidth * 4 / 3)
                    .attr("height", butheight)
                    .attr("x", function (d, i) {
                        return i * butwidth * 4 / 3
                    })
                    .attr("y", 0)
                    // .attr("rx", 5).attr("ry", 5)
                    .attr("fill", function (d, i) {
                        return bigcolor[categorylist.indexOf(text)];
                    });

                var signalbuttontext = signalbuttong.append("text")
                    .attr("id", function (d, i) {
                        return "sig" + i
                    })
                    .text(function (d) {
                        return d.key
                    })
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "middle")
                    .attr("x", function (d, i) {
                        return i * butwidth * 4 / 3 + butwidth * 2 / 3
                    })
                    .attr("y", butheight / 2)
                    .attr("fill", "black")
                    .style("font-weight", "bold");

                signalbuttong.on("mouseover", function () {
                    if (d3.select(this).select("rect").attr("fill") != pressedbcolor) {
                        d3.select(this).select("rect").attr("fill", hoverbcolor);
                    }
                })
                    .on("mouseout", function () {
                        if (d3.select(this).select("rect").attr("fill") != pressedbcolor) {
                            d3.select(this).select("rect").attr("fill", function () {
                                console.log()
                                return bigcolor[categorylist.indexOf(text)]
                            });
                        }else{

                        }
                    })
                    .on("click", function (d, i) {
                        console.log(d, i)
                        updateButtonColors(categorylist[0], d3.select(this), d3.select(this.parentNode));
                        updateclick[0] = i;
                        //changecategory
                        var tochange = d3.select(this).selectAll("text").text();
                        var hidden = d3.selectAll(".pielocchart").selectAll(".piecatchart").attr("visibility", "hidden");
                        var visible = d3.selectAll(".pielocchart").selectAll("g#" + tochange).attr("visibility", "visible");
                        //console.log(updateclick)
                    });

                ghsbutton.on("click", function (a, i) {
                    ////////////
                    //color change doesn't work --- have to find another solution.
                    a = d3.select(this).selectAll(".ghsbutimg").attr("id")
                    updateclick[1] = a;
                    if (updateclick[0] != 10) { //which is not an initial status
                        update_Table(data[Object.keys(data)[updateclick[0]]][updateclick[1]], updateclick, piedata);
                    }
                })
                .on("mouseover", function(){
                  var id = d3.select(this).selectAll(".ghsbutimg").attr("id");
                  var tooltip1 = tsvg.selectAll("g#tooltip"+id);
                  let mouse = d3.mouse(this);
                  if(id == 'GHS08' || id == 'GHS09' || id == 'GHS07'){
                    console.log(id);
                    tooltip1.attr('transform',function(d,i){
                        return 'translate('+(mouse[0]-40*(5-i)) +','+(mouse[1]-20)+')'}).attr("visibility", "visible");
                  }
                  else{
                    tooltip1.attr('transform','translate('+(mouse[0]+5) +','+(mouse[1]-20)+')').attr("visibility", "visible");
                  }
                  })
              	.on("mousemove", function(){
                  var id = d3.select(this).selectAll(".ghsbutimg").attr("id")
                  var tooltip1 = tsvg.selectAll("g#tooltip"+id)
                  let mouse = d3.mouse(this);
                  if(id == 'GHS08' || id == 'GHS09' || id=='GHS07'){
                    console.log(mouse[0]);
                    tooltip1.attr('transform',function(d,i){
                      return 'translate('+(mouse[0]-40*(5-i)) +','+(mouse[1]-20)+')';
                    });
                  }
                  else{
                    tooltip1.attr('transform','translate('+(mouse[0]+5) +','+(mouse[1]-20)+')');
                  }
                  })
              	.on("mouseout", function(){
                  var id =d3.select(this).selectAll(".ghsbutimg").attr("id");
                  var tooltip1= tsvg.selectAll("g#tooltip"+id);
                  tooltip1.attr("visibility", "hidden");});
                break;
            case categorylist[1]: //Metal
            case categorylist[2]: // IARC
            case categorylist[3]: //Pops
                buttonspace.selectAll(".subbut").remove();
                var subbuttonspace = buttonspace.append('g')
                    .attr('class', 'subbut')
                    .attr('transform', 'translate(0,' + 30 + ')');

                var metalbutton = subbuttonspace.selectAll('g.metbut')
                    .data(d3.entries(data))
                    .enter()
                    .append('g')
                    .attr('class', 'metbut')
                    .style("cursor", "pointer");

                metalbutton.append('rect')
                    .attr("id", function (d, i) {
                        return text + i
                    })
                    .attr("width", function (d) {
                        if (text == categorylist[1]) return butwidth;
                        if (text == categorylist[2]) return butwidth * 4 / 5;
                        if (text == categorylist[3]) return butwidth * 2;
                    })
                    .attr("height", butheight)
                    .attr("x", function (d, i) {
                        if (text == categorylist[1]) return i * butwidth;
                        if (text == categorylist[2]) return i * butwidth * 4 / 5;
                        if (text == categorylist[3]) return i * butwidth * 2;
                    })
                    .attr("y", 0)
                    // .attr("rx", 5).attr("ry", 5)
                    .attr("fill", defaultbcolor);

                metalbutton.append('text')
                    .attr("id", function (d, i) {
                        return text + i
                    })
                    .text(function (d) {
                        return d.key
                    })
                    .attr("x", function (d, i) {
                        if (text == categorylist[1]) return i * butwidth + butwidth / 2;
                        if (text == categorylist[2]) return i * butwidth * 4 / 5 + butwidth * 2 / 5;
                        if (text == categorylist[3]) return i * butwidth * 2 + butwidth;
                    })
                    .attr("y", butheight / 2)
                    .attr("dominant-baseline", "central")
                    .attr("text-anchor", "middle")
                    .attr("fill", "black")
                    .style("font-weight", "bold");

                metalbutton.on("mouseover", function () {
                    if (d3.select(this).select("rect").attr("fill") != pressedbcolor) {
                        d3.select(this).select("rect").attr("fill", hoverbcolor);
                    }
                })
                    .on("mouseout", function () {
                        if (d3.select(this).select("rect").attr("fill") != pressedbcolor) {
                            d3.select(this).select("rect").attr("fill", defaultbcolor);
                        }
                    })
                    .on("click", function (d, i) {
                        //console.log(text+i);
                        var txt = d3.select(this).selectAll("text#" + text + i).text();
                        updateButtonColors(text, d3.select(this), d3.select(this.parentNode));
                        update_Table_temp(data[txt], piedata, txt, text);
                    });
                break;
            default:
                console.log("error!");
                break;
        }
    });
}

function update_Table_temp(data, pie, text, bigcat) {
    console.log(data);
    console.log(pie);
    console.log(text);
    tsvg.selectAll(".category").remove();
    var cnum = 0;
    var elnum = -1;
    var category = tsvg.append("g")
        .attr("class", "category");

    /*category.append("text")
        .text(text)
        .attr('id', text)
        .attr('x', tmargin.left)
        .attr('y', tmargin.top)
        .style("font-size", "13px")
        .style("font-weight", "bold");*/

    var elements = category.selectAll('g.elements')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'elements');

    var k = elements.append('text')
        .attr('class', 'elements')
        .text(function (d) {
            return d
        })
        .attr('x', tmargin.left)
        .attr('y', function (d, i) {
            elnum = elnum + 1;
            return tmargin.top + tmargin.letter * elnum
        })
        .style('font-size', '13px');

    elnum = -1;

    var values = elements.append('text')
        .attr('class', 'values')
        .text(function (d) {
          var newclickcal = clickcal.filter(function(f){return f["location"] == pie[0][0][5] && f["category"] == bigcat});
          // console.log(newclickcal[0]["value"]);
          // console.log(text + d);
          if(newclickcal[0]["value"][text].hasOwnProperty(d))
            return +newclickcal[0]["value"][text][d].toFixed(3); //value
          return "None";
        })
        .attr('x', tmargin.left + tmargin.element + tmargin.value)
        .attr('y', function (d, i) {
            elnum = elnum + 1;
            return tmargin.top + tmargin.letter * elnum
        })
        .style('font-size', '13px');

    elements.on("mouseover",function(d,i){
        var id = d3.select(this).selectAll("text.elements").text().replace(/(\s*)/g,"").replace('(',"").replace(')',"");
        console.log(id)
        d3.select(this).selectAll("text.elements").style("font-weight","bold");
        svg.selectAll("path#"+id).attr('stroke', '#fff')
                                .attr('stroke-width', '2px')
                                /*.style("filter", "url(#drop-shadow)")*/
                                .transition()
                                .duration(500);
    }).on("mouseout",function(d,i){
      var id = d3.select(this).selectAll("text.elements").text().replace(/(\s*)/g,"").replace('(',"").replace(')',"");
      d3.select(this).selectAll("text.elements").style("font-weight","normal");
      svg.selectAll("path#"+id).attr('stroke', 'none')
                              .transition()
                              .duration(500);
    })
}


function update_Table(data, updateclick, pie) {
    // console.log("update Table");
    // console.log(pie);
    // console.log(data);
    tsvg.selectAll(".category").remove();

    //spread all the data
    //일단 category가 정해진게 없으니 Danger와 Warning으로 뿌린다.
    //category가 정해지고 나면 category.json에 추가해서 뿌리면 된다. 그 후에 Danger와 Warning은 색깔로 구분해서 뿌려줄 예정.

    //나머지 카테고리들은 그냥 그 카테고리를 이용해서 뿌려준다.
    var datac = d3.entries(data);
    var cnum = 0;
    var elnum = -1;
    var category = tsvg.selectAll(".category")
        .data(datac)
        .enter()
        .append("g")
        .attr("class", "category");

    category.append("text")
        .text(function (d) {
            return d.key
        })
        .attr('id', function (d, i) {
            return "category" + i;
        })
        .attr('x', tmargin.left)
        .attr('y', function (d, i) {
            var result = tmargin.top2 + tmargin.letter * cnum;
            cnum += Object.keys(d.value).length;
            return result;
        }).style("font-size", "13px")
        .style("font-weight", "bold");

    var elements = category.selectAll('.elements')
        .data(function (d) {
            // console.log(d);
            return d.value;
        })
        .enter()
        .append('g')
        .attr('class', 'elements');

    var k = elements.append('text')
                    .attr('class', 'elements')
                  .text(function (d) {
                      return d;
                  })
                  .attr('x', tmargin.left + tmargin.element)
                  .attr('y', function (d, i) {
                      elnum = elnum + 1;
                      return tmargin.top2 + tmargin.letter * elnum
                  })
                  .style('font-size', '10px');
    elnum = -1;

    //have to filter the value data -- because we don't have value info inside the category.json file.

    var values = elements.append('text')
        .attr('class', 'values')
        .text(function (d) {
          var dw;
          // console.log(data.Danger);
          if(data.Danger.includes(d)) dw = "Danger"; else dw = "Warning";
          var cat;
          if(updateclick[0] == 0) cat = "ECHA";
          if(updateclick[0] == 1) cat = "NITE-CMC";
          if(updateclick[0] == 2) cat = "EUREG";
          var newclickcal = clickcal.filter(function(f){return f["location"] == pie[0][0][5] && f["category"] == cat});
          // console.log(newclickcal[0]["value"]);
          // console.log(cat + updateclick[1] + dw + d);
          if(newclickcal[0]["value"][updateclick[1]][dw].hasOwnProperty(d))
            return +newclickcal[0]["value"][updateclick[1]][dw][d].toFixed(3); //value
          return "None";
        })
        .attr('x', tmargin.left + tmargin.element + tmargin.value)
        .attr('y', function (d, i) {
            elnum = elnum + 1;
            return tmargin.top2 + tmargin.letter * elnum
        });

    elements.on("mouseover",function(d,i){
        var id = d3.select(this).selectAll("text.elements").text().replace(/(\s*)/g,"").replace('(',"").replace(')',"");
        console.log(id)
        d3.select(this).selectAll("text.elements").style("font-weight","bold");
        svg.selectAll("path#"+id).attr('stroke', '#fff')
                                .attr('stroke-width', '2px')
                                /*.style("filter", "url(#drop-shadow)")*/
                                .transition()
                                .duration(500);
    }).on("mouseout",function(d,i){
      var id = d3.select(this).selectAll("text.elements").text().replace(/(\s*)/g,"").replace('(',"").replace(')',"");
      d3.select(this).selectAll("text.elements").style("font-weight","normal");
      svg.selectAll("path#"+id).attr('stroke', 'none')
                              .transition()
                              .duration(500);
    })
}

function updateButtonColors(text, button, parent) {
    var defaultbcolor = bigcolor[categorylist.indexOf(text)];
    var pressedbcolor = "white";
    parent.selectAll("rect").attr("fill", defaultbcolor);
    button.select("rect").attr("fill", pressedbcolor);
}

function handleMouseOver(d, i) {
    // console.log(d);
    var nowarc = d3.select(this);
    var parentgroup = d3.select(this.parentNode);
    var unit;
    for(var prop in units){
      console.log(prop);
      if(units[prop].includes(d[2])) unit = prop;
    }
    parentgroup.selectAll('text#first').text(d[2]);
    if(((d[3] == 1 && d[6] =="Metal") || (d[3] == 1 && d[6] =="IARC") || (d[3] == 1 && d[6] =="POPs")) || (d[3] == 2 && d[6] =="ECHA") ||(d[3] == 2 && d[6] =="NITE-CMC")||(d[3] == 2 && d[6] =="EUREG") )
      parentgroup.selectAll('text#second').text(""+(+d[4].toFixed(1))+unit);
    else parentgroup.selectAll('text#second').text(+d[4].toFixed(1));
    var changecolor = nowarc.selectAll('path')
        .attr('stroke', '#fff')
        .attr('stroke-width', '1px')
        /*.style("filter", "url(#drop-shadow)")*/
        .transition()
        .duration(500);
    var text = d3.selectAll("text.centertext")
    //nowarc.style("")
}

function handleMouseOut(d, i) {
    console.log("out");
    var nowarc = d3.select(this);
    nowarc.selectAll('path').attr('stroke','none');
    /*nowarc.selectAll('path').attr('stroke', 'none').style("filter", "none");*/
}


function init_table(piedata) {
    var list = []
    list.push(d);
    var cnum = 0;
    var elnum = -1;

    var d = clickcal.filter(function(d){ return d["location"] == pie[0][0][0]});

    var category = tsvg.selectAll('.category')
        .data((d.map(function (d) {
            return d3.entries(d.values)
        })))
        .enter()
        .append('g')
        .attr('class', 'category')
        .selectAll('text')
        .data(function (d) {
            return d;
        })
        .enter()

    category.append('text')
        .text(function (d) {
            return d.key
        })
        .attr('id', function (d, i) {
            return "category" + i;
        })
        .attr('x', tmargin.left)
        .attr('y', function (d, i) {
            var result = tmargin.top2 + tmargin.letter * cnum;
            cnum += Object.keys(d.value).length;
            return result;
        })
        .style("font-size", "13px")
        .style("font-weight", "bold");

    var elements = category.selectAll('.elements')
        .data(function (d) {
            var list = [];
            list.push(d);
            return list.map(function (d) {
                return d3.entries(d.value)
            });
        })
        .enter()
        .append('g')
        .attr('class', 'elements');

    var k = elements.selectAll('text')
        .data(function (d) {
            return d;
        })
        .enter()
        .append('text')
        .attr('class', 'elements')
        .text(function (d) {
            return d.key
        })
        .attr('x', tmargin.left + tmargin.element)
        .attr('y', function (d, i) {
            console.log(d);
            elnum = elnum + 1;
            return tmargin.top2 + tmargin.letter * elnum
        })
        .style("font-size", "10px");

    elnum = -1;

    var values = elements.selectAll('text.values')
        .data(function (d) {
            return d;
        })
        .enter()
        .append('text')
        .attr('class', 'values')
        .text(function (d) {
            return d.value
        })
        .attr('x', tmargin.left + tmargin.element + tmargin.value)
        .attr('y', function (d, i) {
            console.log(d);
            elnum = elnum + 1;
            return tmargin.top2 + tmargin.letter * elnum
        });
}

function trendCheckboxChecked(id) {
    var checkbox = svg.selectAll("g#" + id).selectAll("rect");
    if (checkbox.attr("fill") == "white")
        checkbox.attr("fill", "black");
    else {
        checkbox.attr("fill", "white");
    }
}

function init() {
    var checkg = svg.selectAll("g.checkbox")
        .data(d3.entries(pixel))
        .enter()
        .append("g")
        .attr("class", "checkbox")
        .attr("id", function (d, i) {
            return d.key;
        })
        .attr("transform", function (d) {
            return "translate(" + (d.value[0] + margin.left) + "," + (d.value[1] + margin.top) + ")"
        });

    checkg.append("rect")
        .attr("class", "checkbox")
        .attr("width", 10)
        .attr("height", 10)
        .attr("stroke", 'black')
        .attr("fill", "white");

    checkg.on("click", function (d) {
         var thisa = d3.select(this).selectAll("rect.checkbox");
        var id = d3.select(this).attr("id");
        if (thisa.attr("fill") == "white") {
            thisa.attr("fill", "black");
        }
        else {
            thisa.attr("fill", "white");
        }
        console.log(document.getElementById("btn"+id));
        //document.getElementById("btn"+id).on('click');
        d3.selectAll('#btn'+id).dispatch("click");
    });
}
