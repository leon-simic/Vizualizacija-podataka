const populationColors = [
    "#f4f6fc", "#dee4f6", "#c7d1f0", "#b1bfea", "#9bade4",
    "#849ade", "#6e88d8", "#5876d2", "#4163cc", "#3355be",
    "#2d4ba7", "#274191", "#21377b", "#1b2d64", "#15234e",
    "#0f1938", "#090f21", "#03050b"
];

const lifeExpectancyColors = [
    "#daf5d6", "#91e085", "#48cb34", "#2b7a1f", "#0e290a"
];

const co2EmissionsColors = [
    "#ffcccc", "#ff6666", "#ff0000", "#990000", "#330000"
];

const healthExpenditureColors = [
    "#e0fdfe", "#a3f9fc", "#06959a", "#011e1f"
];

const electricPowerColors = [
    "#f3e5ff", "#e5baff", "#d88fff", "#cc66ff", "#bf3dff",
    "#b214ff", "#9200d6", "#7200a7", "#520078", "#320049"
];

const gdpColors = [
    "#ffe9d1", "#ffc994", "#ffa856", "#f7881a", "#c05d0d"
];

const internetUsageColors = [
    "#e8f3d5", "#d0e7ab", "#b9dc81", "#a2d157", "#8bc52e",
    "#75a823", "#5e8b19", "#476e0f", "#305105", "#193402"
];

const obesityColors = [
    "#ffe5f4", "#ffb8e1", "#ff8ace", "#ff5dba", "#ff30a7",
    "#e00086"
];

const beerConsumptionColors = [
    "#f5f4d6", "#e2e18b", "#cfce3f", "#918c12"
];

var width = 700;
var height = 650;
var center = [5, 70];
var scale = 600;

var selectedValue = "Population";
var selectedYear = 2000;

var projection = d3.geo.mercator().scale(scale).translate([width / 2, 0]).center(center);
var path = d3.geo.path().projection(projection);
var svg = d3.select("#map").append("svg").attr("height", height).attr("width", width);
var countries = svg.append("g");

updateMap(selectedValue, document.querySelector('nav button.active'));

function updateMap(newValue, button = null) {    
    if (button != null){
        updateActiveButton(button);
        removeGraphs();
    }

    selectedValue = newValue;

    d3.json("statistics.json", function(data) {
        var allData = data;
        var yearData = data.filter(function(d) {
            return d.Year === selectedYear;
        });

        var colorScale = getColorScale(yearData);
        updateLegend(colorScale);
        
        d3.json("eu.topojson", function(data) {
            var countryPaths = countries.selectAll('.country')
                .data(topojson.feature(data, data.objects.europe).features);

            countryPaths.enter()
                .append('path')
                .attr('class', 'country')
                .attr('d', path)
                .style("stroke", "black")
                .on("mouseover", function(d) {
                    var countryName = d.properties.name;
                    var countryData = allData.find(function(entry) {
                        return entry.Country === countryName && entry.Year === selectedYear;
                    });
                    var tooltip = d3.select("#tooltip");

                    if (countryData) {
                        tooltip.html(countryName + " - " + countryData[selectedValue]);
                    } else {
                        tooltip.html(countryName + " - No data available");
                    }
                    
                    tooltip.style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY + 10) + "px")
                        .classed("hidden", false);
                })
                .on("mouseout", function(d) {
                    d3.select("#tooltip").classed("hidden", true);
                })
                .on("mousemove", function(d) {
                    d3.select("#tooltip")
                        .style("left", (d3.event.pageX + 10) + "px")
                        .style("top", (d3.event.pageY + 10) + "px");
                })
                .on("click", function(d) {
                    var countryName = d.properties.name;
                    makeGraphs(countryName);
                });

            countryPaths.transition()
                .duration(200)  
                .style("fill", function(d) {
                    var countryName = d.properties.name;    
                    var countryData = yearData.find(function(entry) {
                        return entry.Country === countryName;
                    });

                    if (countryData) 
                        return colorScale(countryData[selectedValue]);
                    else 
                        return "lightgray";
                });

            countryPaths.exit().remove();
        });
    });
}

function updateYear(year) {
    selectedYear = parseInt(year);
    document.getElementById('yearLabel').textContent = year;
    updateMap(selectedValue);
}

function updateActiveButton(button) {
    const buttons = document.querySelectorAll('nav button');
    buttons.forEach(btn => btn.classList.remove('active'));

    button.classList.add('active');
}

function removeGraphs() {
    window.scrollBy(0, -2000);
    d3.select("#selectedCountryContainer").select("h2").remove();
    d3.selectAll("#firstGraph svg").remove();
    d3.selectAll("#secondGraph svg").remove();
}

function smoothScroll(targetY, duration) {
    const startY = window.scrollY;
    const differenceY = targetY - startY;
    let startTime = null;

    function scrollStep(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easeProgress = easeInOutQuad(progress);

        window.scrollTo(0, startY + differenceY * easeProgress);

        if (timeElapsed < duration) {
            requestAnimationFrame(scrollStep);
        }
    }

    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    requestAnimationFrame(scrollStep);
}

function makeGraphs(countryName) {
    switch (selectedValue) {
        case "Population":
            makeAllGraphs(
                countryName,
                populationColors[parseInt(populationColors.length / 2)],
                "GDP per capita, PPP (current international $)",
                gdpColors[parseInt(gdpColors.length / 2)],
                "Health expenditure (% of GDP)",
                healthExpenditureColors[parseInt(healthExpenditureColors.length / 2)]
            );
            break;
        case "Life Expectancy":
            makeAllGraphs(
                countryName,
                lifeExpectancyColors[parseInt(lifeExpectancyColors.length / 2)],
                "Health expenditure (% of GDP)",
                healthExpenditureColors[parseInt(healthExpenditureColors.length / 2)],
                "Obesity among adults (%)",
                obesityColors[parseInt(obesityColors.length / 2)]
            );
            break;
        case "CO2 emissions per capita (t)":
            makeAllGraphs(
                countryName,
                co2EmissionsColors[parseInt(co2EmissionsColors.length / 2)],
                "Electric power consumption per capita (kWh)",
                electricPowerColors[parseInt(electricPowerColors.length / 2)],
                "GDP per capita, PPP (current international $)",
                gdpColors[parseInt(gdpColors.length / 2)]
            );
            break;
        case "Health expenditure (% of GDP)":
            makeAllGraphs(
                countryName,
                healthExpenditureColors[parseInt(healthExpenditureColors.length / 2)],
                "Obesity among adults (%)",
                obesityColors[parseInt(obesityColors.length / 2)],
                "Life Expectancy",
                lifeExpectancyColors[parseInt(lifeExpectancyColors.length / 2)]
            );
            break;
        case "Electric power consumption per capita (kWh)":
            makeAllGraphs(
                countryName,
                electricPowerColors[parseInt(electricPowerColors.length / 2)],
                "CO2 emissions per capita (t)",
                co2EmissionsColors[parseInt(co2EmissionsColors.length / 2)],
                "Individuals using the Internet (%)",
                internetUsageColors[parseInt(internetUsageColors.length / 2)]
            );
            break;
        case "GDP per capita, PPP (current international $)":
            makeAllGraphs(
                countryName,
                gdpColors[parseInt(gdpColors.length / 2)],
                "Population",
                populationColors[parseInt(populationColors.length / 2)],
                "CO2 emissions per capita (t)",
                co2EmissionsColors[parseInt(co2EmissionsColors.length / 2)]
            );
            break;
        case "Individuals using the Internet (%)":
            makeAllGraphs(
                countryName,
                internetUsageColors[parseInt(internetUsageColors.length / 2)],
                "Electric power consumption per capita (kWh)",
                electricPowerColors[parseInt(electricPowerColors.length / 2)],
                "CO2 emissions per capita (t)",
                co2EmissionsColors[parseInt(co2EmissionsColors.length / 2)]
            );
            break;
        case "Obesity among adults (%)":
            makeAllGraphs(
                countryName,
                obesityColors[parseInt(obesityColors.length / 2)],
                "Life Expectancy",
                lifeExpectancyColors[parseInt(lifeExpectancyColors.length / 2)],
                "Health expenditure (% of GDP)",
                healthExpenditureColors[parseInt(healthExpenditureColors.length / 2)]
            );
            break;
        case "Beer consumption per capita (l)":
            makeAllGraphs(
                countryName,
                beerConsumptionColors[parseInt(beerConsumptionColors.length / 2)],
                "Obesity among adults (%)",
                obesityColors[parseInt(obesityColors.length / 2)],
                "Health expenditure (% of GDP)",
                healthExpenditureColors[parseInt(healthExpenditureColors.length / 2)]
            );
            break;
    }
}

function makeAllGraphs(countryName, selectedValueColor,
    firstValue, firstValueColor, secondValue, secondValueColor) {
        makeGraph("#firstGraph", countryName, selectedValue, selectedValueColor, firstValue, firstValueColor);
        makeGraph("#secondGraph", countryName, selectedValue, selectedValueColor, secondValue, secondValueColor);
}

function makeGraph(graphId, countryName, firstValue, firstValueColor, secondValue, secondValueColor){
    d3.json("statistics.json", function(data) {
        var countryData = data.filter(function(d) {
            return d.Country === countryName;
        });

        if (countryData.length === 0) {
            removeGraphs();
            return;
        }

        d3.select("#selectedCountryContainer").select("h2").remove();

        d3.select("#selectedCountryContainer")
            .append("h2")
            .text(countryName);

        d3.select(graphId).html("");

        countryData.forEach(function(d) {
            d.year = new Date(d.Year, 0, 1);
            d.firstValue = d[firstValue];
            d.secondValue = d[secondValue];
        });

        var margin = { top: 40, bottom: 70, left: 130, right: 130 };
        var width = window.width / 2 + 80;
        var height = 550 - margin.top - margin.bottom;

        var svg = d3.select(graphId)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("background-color", "white")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var x = d3.time.scale()
            .domain(d3.extent(countryData, function(d) { return d.year; }))
            .range([0, width]);

        var minFirstValue = d3.min(countryData, function(d) { return d.firstValue; });
        var minFirstValuePadding = minFirstValue * 0.97;
        
        var y0 = d3.scale.linear()
            .domain([minFirstValuePadding, d3.max(countryData, function(d) { return d.firstValue; })])
            .range([height, 0]);

        var minSecondValue = d3.min(countryData, function(d) { return d.secondValue; });
        var minSecondValuePadding = minSecondValue * 0.97;

        var y1 = d3.scale.linear()
            .domain([minSecondValuePadding, d3.max(countryData, function(d) { return d.secondValue; })])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(10, 3);

        var yAxisLeft = d3.svg.axis()
            .scale(y0)
            .orient("left")
            .tickSize(10, 3)
            .tickFormat(formatYAxisValue);

        var yAxisRight = d3.svg.axis()
            .scale(y1)
            .orient("right")
            .tickSize(10, 3)
            .tickFormat(formatYAxisValue);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "16px");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxisLeft)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2))
            .attr("y", -((margin.left / 2) + 20))
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text(firstValue)
            .style("font-size", "16px");

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + " ,0)")   
            .call(yAxisRight)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -(height / 2))
            .attr("y", (margin.right / 2) + 30)
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text(secondValue)
            .style("font-size", "16px");

        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", (height + (margin.bottom / 2)))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Year");

        var populationLine = d3.svg.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y0(d.firstValue); })
            .defined(function(d) { return d.firstValue !== null; });

        var firstValueLine = d3.svg.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y1(d.secondValue); })
            .defined(function(d) { return d.secondValue !== null; });

        svg.append("path")
            .attr("class", "line")
            .attr("d", populationLine(countryData))
            .style("stroke", firstValueColor)
            .style("stroke-width", "3px")
            .attr("fill", "none");

        svg.append("path")
            .attr("class", "line")
            .attr("d", firstValueLine(countryData))
            .style("stroke", secondValueColor)
            .style("stroke-width", "3px")
            .attr("fill", "none");

        var legend = d3.select(graphId)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", 70)
            .style("background-color", "white")
            .append("g")
            .attr("transform", "translate(" + (margin.left + 50) + ", 0)");

        var legendData = [
            {label: firstValue, color: firstValueColor},
            {label: secondValue, color: secondValueColor}
        ];

        var legendItem = legend.selectAll(".legend-item")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", function(d, i) { return "translate(0, " + (i * 30) + ")"; });

        legendItem.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d) { return d.color; });

        legendItem.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function(d) { return d.label; });
        
        smoothScroll(2000, 1000)
    });
}

function formatYAxisValue(value) {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(2) + " M";
    } else if (value >= 1000) {
        return (value / 1000).toFixed(2) + " K";
    } else {
        return value;
    }
}

function getColorScale(data) {
    var minValue = d3.min(data, function(d) {
        return d[selectedValue];
    });

    var maxValue = d3.max(data, function(d) {
        return d[selectedValue];
    });

    var colorScale;
    switch (selectedValue) {
        case "Population":
            colorScale = d3.scale.quantize()
                .domain([minValue, maxValue])
                .range(populationColors);
            break;
        case "Life Expectancy":
            colorScale = d3.scale.quantize()
                .domain([minValue, maxValue])
                .range(lifeExpectancyColors);
            break;
        case "CO2 emissions per capita (t)":
            colorScale = d3.scale.quantize()
                .domain([minValue, maxValue])
                .range(co2EmissionsColors);
            break;
        case "Health expenditure (% of GDP)":
            colorScale = d3.scale.quantize()
                .domain([minValue, maxValue])
                .range(healthExpenditureColors);
            break;
        case "Electric power consumption per capita (kWh)":
            colorScale = d3.scale.quantize()
                .domain([minValue, maxValue])
                .range(electricPowerColors);
            break;
        case "GDP per capita, PPP (current international $)":
            colorScale = d3.scale.quantize()
                .domain([minValue, maxValue])
                .range(gdpColors);
            break;
        case "Individuals using the Internet (%)":
            colorScale = d3.scale.quantize()
                .domain([minValue, maxValue])
                .range(internetUsageColors);
            break;
        case "Obesity among adults (%)":
            colorScale = d3.scale.quantize()
                .domain([minValue, maxValue])
                .range(obesityColors);
            break;
        case "Beer consumption per capita (l)":
            colorScale = d3.scale.quantize()
                .domain([minValue, maxValue])
                .range(beerConsumptionColors);
            break;
    }
    return colorScale;
}

function updateLegend(colorScale) {
    var legendData = colorScale.range().map(function(color) {
        var d = colorScale.invertExtent(color);
        return {
            color: color,
            min: d[0],
            max: d[1]
        };
    });

    var legend = d3.select("#legend");
    legend.selectAll("*").remove();

    var legendContainer = legend.append("div")
        .attr("class", "legend-container")

    var noDataItem = legendContainer.append("div")
        .attr("class", "legend-item");
    noDataItem.append("div")
        .style("background-color", "lightgray");
    noDataItem.append("div")
        .text("No data");

    var firstItem = legendContainer.selectAll(".legend-item").filter(function(d, i) { return i === 0; });
    firstItem.remove();
    
    var legendItem = legendContainer.selectAll(".legend-item")
        .data(legendData)
        .enter().append("div")
        .attr("class", "legend-item")

    legendItem.append("div")
         .style("background-color", function(d) { return d.color; });

    legendItem.append("div")
        .text(function(d, i) { 
            if (i === 0) {
                return formatValue(d.min, d.max - 0.1);
            } else if (i === legendData.length - 0.1) {
                return formatValue(d.min, d.max);
            } else {
                return formatValue(d.min, d.max - 0.1);
            }
        })

    legendContainer.insert(function() { return firstItem.node(); }, ":first-child");
}

function formatValue(min, max) {
    var minToFixed = min.toFixed(1);
    var maxToFixed = max.toFixed(1);

    var minValue = minToFixed == parseInt(minToFixed) ? parseInt(minToFixed) : minToFixed;
    var maxValue = maxToFixed == parseInt(maxToFixed) ? parseInt(maxToFixed) : maxToFixed;
    return minValue + " - " + maxValue;
    
    if (parseInt(min) == parseInt(max)) {
        return min.toFixed(1) + " - " + max.toFixed(1);
    } else {
        return parseInt(min) + " - " + parseInt(max);
    }
}