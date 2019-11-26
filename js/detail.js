let timelineWidth = 610,
    timelineHeight = 480,
    timelineAlign = 'h', // horizontal or vertical
    detailWidth = 500;


// let detailsvg =
//     d3.select('#correlation')
//         .attr('height', timelineHeight)
//         .attr('width', timelineWidth + detailWidth);
let timeline = d3.select('#detail-container')
    .append('svg')
    .attr('class', 'timeline')
    .attr('width', 828)
    .attr('height', timelineHeight);

let each_width = timelineWidth,
    each_height = timelineHeight;
let timelineA =
    timeline.append('g')
        .attr('class', 'timelineA')
        .attr('height', each_height)
        .attr('width', each_width);
let mouseG = timeline.append("g")
    .attr("class", "mouse-over-effects")
    .attr('transform', 'translate(30,30)');

let pointListView =
    timeline.append('g')
        .attr('class', 'pointList')
        .attr('transform', 'translate(' + 674 + ',' + 0 + ')');
pointListView.append('rect')
    .attr('width', 150)
    .attr('height', 480)
    .attr('rx', 1)
    .attr('ry', 1)
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .style('fill', 'transparent');

let current_items = [],
    points = [],
    lineData = [[], []],
    location_by = {};

let itemHeight = 50,
    itemGap = 5,
    itemWidth = 150;


// console.log(chemical_list)


function readOraganized() {
    d3.json("../data/organized_fixed.json", function (error, json) {
        listloc.forEach(function (loc) {
            location_by[loc] = json.data.filter(x => x.location == loc);
        });
        listloc.forEach(function (loc) {
            location_by[loc].forEach(function (d, i) {
                location_by[loc][i]['date'] = parseTime(location_by[loc][i]['date'])
            })
        });
        console.log(location_by)
    });
}

// let zoomXA = d3.zoom()
//     .on("zoom", zoomFunctionXA);
// let zoomYA = d3.zoom()
//     .on("zoom", zoomFunctionYA);
let horA = {
    'scaleX1': d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth]),
    'scaleX2': d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth]),
    'scaleY1': d3.scaleLinear().domain([0, 20]).range([0, timelineHeight / 2 - 20]),
    'scaleY2': d3.scaleLinear().domain([0, 20]).range([0, timelineHeight / 2 - 20]),
}, horB = {
    'scaleX1': d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth]),
    'scaleX2': d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth]),
    'scaleY1': d3.scaleLinear().domain([0, 20]).range([0, timelineHeight / 2 - 20]),
    'scaleY2': d3.scaleLinear().domain([0, 20]).range([0, timelineHeight / 2 - 20]),
};
// , verA = {
//     'scaleX1': d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth / 2]),
//     'scaleX2': d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth / 2]),
//     'scaleY1': d3.scaleLinear().domain([0, 20]).range([0, timelineHeight]),
//     'scaleY2': d3.scaleLinear().domain([0, 20]).range([0, timelineHeight]),
// }, verB = {
//     'scaleX1': d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth / 2]),
//     'scaleX2': d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth / 2]),
//     'scaleY1': d3.scaleLinear().domain([0, 20]).range([0, timelineHeight]),
//     'scaleY2': d3.scaleLinear().domain([0, 20]).range([0, timelineHeight]),
// };


// let scaleXA = d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth]),
//     scaleXA2 = d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth]),
//     scaleYA = d3.scaleLinear().domain([0, 20]).range([0, timelineHeight / 2 - 20]),
//     scaleYA2 = d3.scaleLinear().domain([0, 20]).range([0, timelineHeight / 2 - 20]),
//     scaleXB = d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth]),
//     scaleXB2 = d3.scaleTime().domain([parseTime('1998-01-01'), parseTime('2016-12-31')]).range([0, timelineWidth]),
//     scaleYB = d3.scaleLinear().domain([0, 20]).range([0, timelineHeight / 2 - 20]),
//     scaleYB2 = d3.scaleLinear().domain([0, 20]).range([0, timelineHeight / 2 - 20]),
//     axisXAtop = d3.axisTop(scaleXA),
//     axisXBtop = d3.axisTop(scaleXB),
//     axisXbottom = d3.axisBottom(scaleXB),
//     axisYAleft = d3.axisLeft(scaleYA),
//     axisYBleft = d3.axisLeft(scaleYB),
//     axisYright = d3.axisRight(scaleYB);

function addPoint(point) {
    points.push(point)

    drawItemList();
}

function removePoint(point) {

    let index = points.indexOf(point);
    if (points.indexOf(point) > -1) {
        points.splice(index, 1);
    }
    // console.log(point)
    // console.log(points)

    drawItemList();
}

function drawItemList() {
    pointListView.selectAll('g')
        .remove();
    let items = pointListView
        .selectAll('.item')
        .data(points)
        .enter().append('g')
        .attr('class', 'item')
        .attr('transform', function (d, i) {
            return 'translate(0,' + (itemGap + i * (itemGap + itemHeight)) + ')';
        });


    items.append('rect')
        .attr('width', itemWidth - 10)
        .attr('height', itemHeight)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('transform', function (d, i) {
            return 'translate(5,0)'
        })
        .attr('stroke', function (d) {
            // console.log(d[0])
            // return colorTrend(d.loc)
            return 'grey';
        })
        .attr('stroke-width', 0)
        .attr('fill', function (d) {
            return 'silver'
        })


    items.append('text')
        .text(function (d) {
            return d.ingredient;
        })
        .attr('x', 10)
        .attr('y', 45)
        .style('font-size', 12)

    items.append('text')
        .text(function (d) {
            return d.loc;
        })
        .attr('x', 10)
        .attr('y', 30)
        .style('font-size', 12)

    items.append('text')
        .text(function (d) {
            return d.time;
        })
        .attr('x', 10)
        .attr('y', 14)
        .style('font-size', 10)

    items.append('rect')
        .attr('class', function (d, i) {
            return 'btnA item-A-btn-' + i
        })
        .attr('width', 10)
        .attr('height', 10)
        .attr('rx', 3)
        .attr('ry', 3)
        // .style('stroke', 'grey')
        // .style('fill', 'grey')
        // .style('opacity', 0.2)
        .style('fill', 'white')
        .style('stroke', 'blue')
        .style('stroke-width', 1)
        .attr('x', 100)
        .attr('y', 5)
        .on('click', function (d, i) {
            if (d3.select(this).classed('selected')) {
                lineData[0] = [];
                d3.select(this).classed('selected', false);
                d3.select('.item-A-txt-' + i).classed('selected', false);
                drawTimeline()
            } else {
                d3.selectAll('.btnA').classed('selected', false);
                d3.selectAll('.txtA').classed('selected', false);
                d3.select(this).classed('selected', true);
                d3.select('.item-A-txt-' + i).classed('selected', true);
                updateLineData('A', d)
            }
        })
        .on('mouseover', function (d, i) {
            // d3.select(this)
            //     .style('fill', 'red')
            // d3.select('.item-B-txt-' + i)
            //     .style('fill', 'white')
            d3.select(this)
                .style('stroke-width', 3)
        })
        .on('mouseout', function (d, i) {
            // d3.select(this)
            //     .style('fill', 'white')
            // d3.select('.item-B-txt-' + i)
            //     .style('fill', 'red')
            d3.select(this)
                .style('stroke-width', 1)
        });

    items.append('rect')
        .attr('class', function (d, i) {
            return 'btnB item-B-btn-' + i
        })
        .attr('width', 10)
        .attr('height', 10)
        .attr('rx', 3)
        .attr('ry', 3)
        .style('fill', 'white')
        .style('stroke', 'red')
        .style('stroke-width', 1)
        .attr('x', 115)
        .attr('y', 5)
        .on('click', function (d, i) {
            console.log('btnb')
            if (d3.select(this).classed('selected')) {
                lineData[1] = [];
                d3.select(this).classed('selected', false);
                d3.select('.item-B-txt-' + i).classed('selected', false);
                drawTimeline()
            } else {
                d3.selectAll('.btnB').classed('selected', false);
                d3.selectAll('.txtB').classed('selected', false);
                d3.select(this).classed('selected', true);
                d3.select('.item-B-txt-' + i).classed('selected', true);
                updateLineData('B', d)

            }
        })
        .on('mouseover', function (d, i) {
            // d3.select(this)
            //     .style('fill', 'red')
            // d3.select('.item-B-txt-' + i)
            //     .style('fill', 'white')
            d3.select(this)
                .style('stroke-width', 3)
        })
        .on('mouseout', function (d, i) {
            // d3.select(this)
            //     .style('fill', 'white')
            // d3.select('.item-B-txt-' + i)
            //     .style('fill', 'red')
            d3.select(this)
                .style('stroke-width', 1)
        });

    items.append('rect')
        .attr('class', function (d, i) {
            return 'item-X-btn-' + i
        })
        .attr('width', 10)
        .attr('height', 10)
        // .style('stroke', 'grey')
        // .style('fill', 'grey')
        .attr('rx', 1)
        .attr('ry', 1)
        // .style('stroke', 'grey')
        // .style('fill', 'grey')
        // .style('opacity', 0.2)
        .style('fill', 'black')
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .attr('x', 130)
        .attr('y', 5)
        .on('click', function (d, i) {
            if (d3.select('.item-A-btn-' + i).classed('selected')) {
                lineData[0] = [];
            }
            if (d3.select('.item-B-btn-' + i).classed('selected')) {
                lineData[1] = [];
            }
            drawTimeline()
            removePoint(d)
        })
        .on('mouseover', function (d, i) {
            d3.select(this)
                .style('stroke-width', 3)
        })
        .on('mouseout', function (d, i) {
            d3.select(this)
                .style('stroke-width', 1)

        });


    items.append('text')
        .text('x')
        .attr('class', function (d, i) {
            return 'item-X-txt-' + i
        })
        .attr('fill', 'white')
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .style('font-weight', 'bold')
        .style('font-size', 10)
        .attr('x', 135)
        .attr('y', 10)
        .on('click', function (d, i) {
            if (d3.select('.item-A-btn-' + i).classed('selected')) {
                lineData[0] = [];
            }
            if (d3.select('.item-B-btn-' + i).classed('selected')) {
                lineData[1] = [];
            }
            drawTimeline()
            removePoint(d)
        })
        .on('mouseover', function (d, i) {
            // d3.select(this)
            //     .style('fill', 'black')
            // d3.select('.item-X-btn-' + i)
            //     .style('fill', 'white')
            d3.select('.item-X-btn-' + i)
                .style('stroke-width', 3)

        })
        .on('mouseout', function (d, i) {
            // d3.select(this)
            //     .style('fill', 'white')
            // d3.select('.item-X-btn-' + i)
            //     .style('fill', 'black')
            d3.select('.item-X-btn-' + i)
                .style('stroke-width', 1)
        });

}

function updateLineData(opt, point) {
    console.log(opt, point)
    if (opt === 'A') {
        let loc = point.loc,
            chem = point.ingredient,
            dt = parseTime(point.date);
        lineData[0] = location_chem.filter(x => x.loc === loc && x.chem === chem)[0]['values'];
    } else {
        let loc = point.loc,
            chem = point.ingredient,
            dt = parseTime(point.date);
        lineData[1] = location_chem.filter(x => x.loc === loc && x.chem === chem)[0]['values'];
    }

    drawTimeline()
}


function drawTimeline() {
    timelineA.selectAll('g').remove();
    timelineA.selectAll('svg').remove();
    mouseG.selectAll('g').remove();
    mouseG.selectAll('path').remove();
    if (lineData[0].length == 0 || lineData[1].length == 0) {
        return
    }

// function drawTimeline(alignvalue, loc, dt) {
    // tmp data
    // updateLineData('A', points[0]);
    // updateLineData('B', points[1]);
    let csA = horA,
        csB = horB;

    csA.scaleY1.domain(d3.extent(lineData[0].map(x => x[1])));
    csA.scaleY2.domain(d3.extent(lineData[0].map(x => x[1])));
    csB.scaleY1.domain(d3.extent(lineData[1].map(x => x[1])));
    csB.scaleY2.domain(d3.extent(lineData[1].map(x => x[1])));


    csA.scaleX1.range([0, each_width - 25]);
    csA.scaleX2.range([0, each_width - 25]);
    csA.scaleY1.range([each_height - 60, 0]);
    csA.scaleY2.range([each_height - 60, 0]);
    csB.scaleX1.range([0, each_width - 25]);
    csB.scaleX2.range([0, each_width - 25]);
    csB.scaleY1.range([each_height - 60, 0]);
    csB.scaleY2.range([each_height - 60, 0]);

    // csA = horA;
    // csB = horB;    // draw A
    let axisXA = d3.axisBottom(csA.scaleX1),
        axisXB = d3.axisTop(csB.scaleX1),
        axisYA = d3.axisLeft(csA.scaleY1),
        axisYB = d3.axisRight(csB.scaleY1);


    let lineGeneratorA = d3.line()
        .x(function (d) {
            return csA.scaleX1(parseTime(d[0]))
        })
        .y(function (d) {
            return csA.scaleY1(d[1])
        });
    let lineGeneratorB = d3.line()
        .x(function (d) {
            return csB.scaleX1(parseTime(d[0]))
        })
        .y(function (d) {
            return csB.scaleY1(d[1])
        });


    let areaGeneratorA = d3.area()
        .x(function (d) {
            return csA.scaleX1(parseTime(d[0]))
        })
        .y0(function (d) {
            return 420
        })
        .y1(function (d) {
            return csA.scaleY1(d[1])
        });
    let areaGeneratorB = d3.area()
        .x(function (d) {
            return csB.scaleX1(parseTime(d[0]))
        })
        .y0(function (d) {
            return 420
        })
        .y1(function (d) {
            return csB.scaleY1(d[1])
        });
    // timeline.selectAll('rect')
    //     .remove();

    mouseG.selectAll('path').remove();
    mouseG.selectAll('g').remove();
    mouseG.selectAll('rect').remove();


    let zoomBarA = timelineA.append('g')
        .attr("class", "zoom zoom-A");

    // axis
    let linesA = timelineA.append('svg')
        .attr('class', 'linesA')
        .attr('transform', 'translate(20,10)')
        .attr('width', each_width - 25)
        .attr('height', each_height - 60)
        .attr('x', 30)
        .attr('y', 30);
    let mouseTracker = linesA.append('g');
    mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line mouse-line-AH")
        .style("stroke", "grey")
        .style("stroke-width", "1px")
        .style("opacity", "0")
        .style("stroke-dasharray", ("2, 1"));
    mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line mouse-line-AV")
        .style("stroke", "grey")
        .style("stroke-width", "1px")
        .style("opacity", "0")
        .style("stroke-dasharray", ("2, 1"));

    mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line mouse-line-BH")
        .style("stroke", "grey")
        .style("stroke-width", "1px")
        .style("opacity", "0")
        .style("stroke-dasharray", ("2, 1"));

    mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line mouse-line-BV")
        .style("stroke", "grey")
        .style("stroke-width", "1px")
        .style("opacity", "0")
        .style("stroke-dasharray", ("2, 1"));

    timelineA.append('g')
        .attr('class', 'axisXA')
        .attr('transform', 'translate(30,450)')
        .call(axisXA);
    timelineA.append('g')
        .attr('class', 'axisYA')
        .attr('transform', 'translate(30,30)')
        .call(axisYA);
    timelineA.append('g')
        .attr('class', 'axisXB')
        .attr('transform', 'translate(30,30)')
        .call(axisXB);
    timelineA.append('g')
        .attr('class', 'axisYB')
        .attr('transform', 'translate(' + (timelineWidth + 5) + ',30)')
        .call(axisYB);

    // line

    let lineA = linesA.selectAll('.line-A')
        .data([lineData[0]])
        .enter()
        .append('path')
        .attr('d', lineGeneratorA)
        .attr('class', function (d, i) {
            return 'line line-A'
        })
        .attr("fill", 'none')
        .attr("stroke", function (d, i) {
            return 'blue'
        })
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 0.5);
    let lineB = linesA.selectAll('.line-B')
        .data([lineData[1]])
        .enter()
        .append('path')
        .attr('d', lineGeneratorB)
        .attr('class', function (d, i) {
            return 'line line-B'
        })
        .attr("fill", 'none')
        .attr("stroke", function (d, i) {
            return 'red'
        })
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 0.5);

    let areaA = linesA.selectAll('.area-A')
        .data([lineData[0]])
        .enter()
        .append('path')
        .attr('d', areaGeneratorA)
        .attr('class', function (d, i) {
            return 'area area-A'
        })
        .attr("fill", function (d, i) {
            return 'blue'
        })
        .attr("stroke", function (d, i) {
            return 'blue'
        })
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 0.5)
        .style('opacity', 0.5);


    let areaB = linesA.selectAll('.area-B')
        .data([lineData[1]])
        .enter()
        .append('path')
        .attr('d', areaGeneratorB)
        .attr('class', function (d, i) {
            return 'area area-B'
        })
        .attr("fill", function (d, i) {
            return 'red'
        })
        .attr("stroke", function (d, i) {
            return 'red'
        })
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 0.5)
        .style('opacity', 0.5);
    // console.log('dataA', dataA);
    let zoomXA = d3.zoom().on("zoom", function () {
            zoomFunctionX('A', csA, axisXA, lineGeneratorA, areaGeneratorA)
        }),
        zoomXB = d3.zoom().on("zoom", function () {
            zoomFunctionX('B', csB, axisXB, lineGeneratorB, areaGeneratorB)
        }),
        zoomYA = d3.zoom().on("zoom", function () {
            zoomFunctionY('A', csA, axisYA, lineGeneratorA, areaGeneratorA)
        }),
        zoomYB = d3.zoom().on("zoom", function () {
            zoomFunctionY('B', csB, axisYB, lineGeneratorB, areaGeneratorB)
        });

    zoomBarA.append("rect")
        .attr("class", "zoom zoom-A")
        .attr("width", timelineWidth - 25)
        .attr("height", 30)
        .attr('transform', 'translate(30,450)')
        .style('fill', 'transparent')
        .call(zoomXA);
    zoomBarA.append("rect")
        .attr("class", "zoom zoom-A")
        .attr("width", 30)
        .attr("height", timelineHeight - 60)
        .attr('transform', 'translate(0,30)')
        .style('fill', 'transparent')
        .call(zoomYA);
    // console.log(location_chem.filter(x => x.loc === loc && x.chem === chem)[0]['values'])

    zoomBarA.append("rect")
        .attr("class", "zoom zoom-B")
        .attr("width", each_width - 25)
        .attr("height", 30)
        .attr('transform', 'translate(30,0)')
        .style('fill', 'transparent')
        .call(zoomXB)

    zoomBarA.append("rect")
        .attr("class", "zoom zoom-B")
        .attr("width", 30)
        .attr("height", each_height - 60)
        .attr('transform', 'translate(' + (timelineWidth + 5) + ',30)')
        .style('fill', 'transparent')
        .call(zoomYB)
    //draw B


    // let mouseA = mouseG.append('g')
    //         .attr("class", "mouse-per-line mouse-A"),
    //     mouseB = mouseG.append('g')
    //         .attr("class", "mouse-per-line mouse-B");

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
        .data(lineData)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
        .attr("r", 3)
        .style("stroke", function (d, i) {
            if (i == 0)
                return 'blue';
            else return 'red'
        })
        .style("fill", "none")
        .style("stroke-width", "0.5px")
        .style("opacity", "0");

    mousePerLine.append("text")
        .attr("transform", "translate(10,3)");

    let mouseRectHeight, mouseRectWidth;

    mouseRectHeight = 420;
    mouseRectWidth = timelineWidth - 25;


    mouseG.append('rect') // append a rect to catch mouse movements on canvas
        .attr('width', mouseRectWidth) // can't catch mouse events on a g element
        .attr('height', mouseRectHeight)
        .attr('fill', 'transparent')
        .attr('pointer-events', 'all')
        .on('mouseout', function () { // on mouse out hide line, circles and text
            d3.selectAll(".mouse-line")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "0");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "0");
        })
        .on('mouseover', function () { // on mouse in show line, circles and text
            d3.selectAll(".mouse-line")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line circle")
                .style("opacity", "1");
            d3.selectAll(".mouse-per-line text")
                .style("opacity", "1");
        })
        .on('mousemove', function () { // mouse moving over canvas
            let mouse = d3.mouse(this);
            d3.select(".mouse-line-AH")
                .attr("d", function () {
                    let xDate, bisect;
                    bisect = d3.bisector(function (d) {
                        return parseTime(d[0]);
                    }).right;

                    xDate = csA.scaleX1.invert(mouse[0]);

                    let idx = bisect(lineData[0], xDate);

                    let lines = timeline.selectAll('.line')['_groups'][0];
                    var beginning = 0,
                        end = lines[0].getTotalLength(),
                        target = null;
                    let pos;
                    // console.log('end', end)
                    while (true) {
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[0].getPointAtLength(target);

                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }
                    if (pos.y == 420 || idx === 0 || idx === lineData[0].length) {
                        d3.select(this).style('opacity', 0)
                        var d = "M" + mouse[0] + "," + (pos.y);
                        d += " " + mouse[0] + "," + 0;
                    }
                    else {
                        d3.select(this).style('opacity', 1)
                        var d = "M" + mouse[0] + "," + (pos.y);
                        d += " " + mouse[0] + "," + mouseRectHeight;
                    }
                    console.log('A', pos.y);
                    return d;

                })
                .attr('transform', function (d) {
                    return 'translate(0,0)';

                });
            d3.select(".mouse-line-AV")
                .attr("d", function () {
                    let xDate, bisect;
                    bisect = d3.bisector(function (d) {
                        return parseTime(d[0]);
                    }).right;

                    xDate = csA.scaleX1.invert(mouse[0]);

                    let idx = bisect(lineData[0], xDate);

                    let lines = timeline.selectAll('.line')['_groups'][0];
                    var beginning = 0,
                        end = lines[0].getTotalLength(),
                        target = null;
                    let pos;
                    // console.log('end', end)
                    while (true) {
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[0].getPointAtLength(target);

                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }
                    if (pos.y == 420 || idx === 0 || idx === lineData[0].length) {
                        d3.select(this).style('opacity', 0)
                    } else {
                        d3.select(this).style('opacity', 1)
                    }
                    var d = "M" + mouse[0] + "," + pos.y;
                    d += " " + 0 + "," + pos.y;

                    return d;
                })
                .attr('transform', function (d) {
                    return 'translate(0,0)';

                });

            d3.select(".mouse-line-BH")
                .attr("d", function () {

                    let xDate, bisect;
                    bisect = d3.bisector(function (d) {
                        return parseTime(d[0]);
                    }).right;

                    xDate = csB.scaleX1.invert(mouse[0]);

                    console.log('x', xDate);
                    console.log(lineData)
                    let idx = bisect(lineData[1], xDate);
                    console.log('idx', idx);
                    let lines = timeline.selectAll('.line')['_groups'][0];
                    var beginning = 0,
                        end = lines[1].getTotalLength(),
                        target = null;
                    let pos;
                    // console.log('end', end)
                    while (true) {
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[1].getPointAtLength(target);

                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }
                    if (pos.y == 420 || idx === 0 || idx === lineData[1].length) {
                        // console.log('opacity 0', d3.select(this))
                        d3.select(this).style('opacity', 0)
                    } else {
                        d3.select(this).style('opacity', 1)
                    }
                    var d = "M" + mouse[0] + "," + 0;
                    d += " " + mouse[0] + "," + (pos.y);
                    // console.log('B', pos.y)
                    return d;

                })
                .attr('transform', function (d) {
                    return 'translate(0,0)';

                });
            d3.select(".mouse-line-BV")
                .attr("d", function () {

                    let xDate, bisect;
                    bisect = d3.bisector(function (d) {
                        return parseTime(d[0]);
                    }).right;

                    xDate = csB.scaleX1.invert(mouse[0]);

                    console.log('x', xDate);
                    console.log(lineData)
                    let idx = bisect(lineData[1], xDate);
                    console.log('idx', idx);

                    let lines = timeline.selectAll('.line')['_groups'][0];
                    var beginning = 0,
                        end = lines[1].getTotalLength(),
                        target = null;
                    let pos;
                    // console.log('end', end)
                    console.log('totalpoint', lines[1].getPointAtLength(mouse[0]))
                    while (true) {
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[1].getPointAtLength(target);

                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }
                    if (pos.y == 420 || idx === 0 || idx === lineData[1].length) {
                        console.log('opacity 0', d3.select(this))
                        d3.select(this).style('opacity', 0)
                    } else {
                        d3.select(this).style('opacity', 1)
                    }
                    var d = "M" + mouse[0] + "," + pos.y;
                    d += " " + mouseRectWidth + "," + pos.y;
                    return d;
                })
                .attr('transform', function (d) {
                    return 'translate(0,0)';

                });

            d3.selectAll(".mouse-per-line")
                .attr("transform", function (d, i) {
                    // if (timelineAlign === 'h') {
                    let xDate, bisect
                    bisect = d3.bisector(function (d) {
                        return parseTime(d[0]);
                    }).right;
                    if (i == 0) {
                        xDate = csA.scaleX1.invert(mouse[0]);

                    } else {
                        xDate = csB.scaleX1.invert(mouse[0]);
                    }
                    console.log('x', xDate);
                    idx = bisect(d, xDate);
                    console.log('idx', idx);
                    let lines = timeline.selectAll('.line')['_groups'][0];
                    var beginning = 0,
                        end = lines[i].getTotalLength(),
                        target = null;
                    let pos;
                    // console.log('end', end)
                    while (true) {
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[i].getPointAtLength(target);

                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) end = target;
                        else if (pos.x < mouse[0]) beginning = target;
                        else break; //position found
                    }
                    console.log(pos);
                    if (i == 0) {
                        if (pos.y == 420 || idx === 0 || idx === lineData[0].length) {
                            d3.select(this).select('text')
                                .style('opacity', 0);
                            d3.select(this).select('circle')
                                .style('opacity', 0);
                        } else {
                            d3.select(this).select('text')
                                .style('opacity', 1);
                            d3.select(this).select('circle')
                                .style('opacity', 1);
                        }
                    } else {
                        if (pos.y == 420 || idx === 0 || idx === lineData[1].length) {
                            d3.select(this).select('text')
                                .style('opacity', 0);
                            d3.select(this).select('circle')
                                .style('opacity', 0);
                        } else {
                            d3.select(this).select('text')
                                .style('opacity', 1);
                            d3.select(this).select('circle')
                                .style('opacity', 1);
                        }
                    }


                    if (i == 0) {
                        d3.select(this).select('text')
                            .text('A - ' + csA.scaleY1.invert(pos.y).toFixed(2));
                        return "translate(" + mouse[0] + "," + (pos.y) + ")";
                    }
                    else {
                        d3.select(this).select('text')
                            .text('B - ' + csB.scaleY1.invert(pos.y).toFixed(2));
                        return "translate(" + mouse[0] + "," + (pos.y) + ")";
                    }

                })

        });

    function zoomFunctionX(opt, scale, axis, line, area) {
        // create new scale ojects based on event
        let t = d3.event.transform;
        scale.scaleX1.domain(t.rescaleX(scale.scaleX2).domain());
        d3.select('.axisX' + opt).call(axis);
        d3.select('.line-' + opt).attr("transform", d3.event.transform.rescaleX(scale.scaleX1));
        d3.select('.line-' + opt).attr('d', line);
        d3.select('.area-' + opt).attr("transform", d3.event.transform.rescaleX(scale.scaleX1));
        d3.select('.area-' + opt).attr('d', area);
    }

    function zoomFunctionY(opt, scale, axis, line, area) {
        // create new scale ojects based on event
        let t = d3.event.transform;
        scale.scaleY1.domain(t.rescaleY(scale.scaleY2).domain());
        d3.select('.axisY' + opt).call(axis);
        d3.select('.line-' + opt).attr("transform", d3.event.transform.rescaleY(scale.scaleY1));
        d3.select('.line-' + opt).attr('d', line);
        d3.select('.area-' + opt).attr("transform", d3.event.transform.rescaleY(scale.scaleY1));
        d3.select('.area-' + opt).attr('d', area);
    }
}


// drawTimeline(timelineAlign);
readOraganized()

addPoint({'loc': 'Boonsri', 'time': '2015-09-15', 'ingredient': 'Cesium'})
addPoint({'loc': 'Boonsri', 'time': '2015-09-15', 'ingredient': 'Calcium'})
addPoint({'loc': 'Boonsri', 'time': '2015-09-15', 'ingredient': 'Magnesium'})


drawItemList();
