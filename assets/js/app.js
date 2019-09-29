// @TODO: YOUR CODE HERE!
function makeGraph() {

    // if the SVG area isn't empty when the browser loads, remove it
    // and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width
    // and height of the browser window.
    var svgWidth = (window.innerWidth) * .5;
    var svgHeight = (window.innerHeight) * .6;

    //const svgWidth = 760;
    //const svgHeight = 500;

    // Define the chart's margins as an object
    const margin = {
        top: 60,
        right: 60,
        bottom: 100,
        left: 100
    };

    // Define dimensions of the chart area
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#scatter").append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth)
        .style("background", "#efecea");

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let chosenXAxis = "income";
    let xValue = d => d[chosenXAxis]

    let chosenYAxis = "healthcare";
    let yValue = d => d[chosenYAxis]

    const labels = d => d.abbr;
    const statesLabels = d => d.state;




    // function used for updating x-scale var upon click on axis label
    const xScale = data => {
        const xLinearScale = d3.scaleLinear()
            .domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1])
            .range([0, chartWidth])
            .nice();

        return xLinearScale;
    }

    // function used for updating y-scale var upon click on axis label
    const yScale = data => {
        const yLinearScale = d3.scaleLinear()
            .domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1])
            .range([chartHeight, 0])
            .nice();

        return yLinearScale;
    }


    const renderXAxis = (newXScale, xAxis) => {
        if (chosenXAxis === "income") {

            let bottomAxis = d3.axisBottom(newXScale)
                .tickSize(-chartHeight)
                .tickFormat(d3.format(".2s"))
                .tickPadding(10);

            xAxis.transition()
                .duration(1000)
                .call(bottomAxis);

            return xAxis;

        }
        else {
            let bottomAxis = d3.axisBottom(newXScale)
                .tickSize(-chartHeight)
                .tickPadding(10);

            xAxis.transition()
                .duration(1000)
                .call(bottomAxis);

            return xAxis;

        }


    }

    const renderYAxis = (newYScale, yAxis) => {
        const leftAxis = d3.axisLeft(newYScale)
            .tickSize(-chartWidth)
            .tickPadding(10);;

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCirclesX(circlesGroup, newXScale) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(xValue(d)));

        return circlesGroup;
    }

    function renderStatesX(statesGroup, newXScale) {

        statesGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(xValue(d)));

        return statesGroup;
    }

    function renderCirclesY(circlesGroup, newYScale) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cy", d => newYScale(yValue(d)));

        return circlesGroup;
    }

    function renderStatesY(statesGroup, newYScale) {

        statesGroup.transition()
            .duration(1000)
            .attr("y", d => newYScale(yValue(d)));

        return statesGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, statesGroup) {

        if (chosenXAxis === "income") {
            var xLabel = "Median Income:";
        }
        else if (chosenXAxis === "poverty") {
            var xLabel = "In Poverty:";
        }
        else {
            var xLabel = "Median Age:";

        }

        if (chosenYAxis === "healthcare") {
            var yLabel = "Lacks Healthcare:";
        }
        else if (chosenYAxis === "smokes") {
            var yLabel = "Smokes:";
        }
        else {
            var yLabel = "Obese:";

        }

        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([80, -60])
            .html(function (d) {
                if (chosenXAxis === "poverty") {
                    return (`<strong>${d["state"]}</strong><br>${yLabel} ${d[chosenYAxis]}%<br>${xLabel} ${d[chosenXAxis]}%`);
                }
                else if (chosenXAxis === "income") {
                    return (`<strong>${d["state"]}</strong><br>${yLabel} ${d[chosenYAxis]}%<br>${xLabel} $${d[chosenXAxis].toLocaleString()}`);

                }
                else {
                    return (`<strong>${d["state"]}</strong><br>${yLabel} ${d[chosenYAxis]}%<br>${xLabel} ${d[chosenXAxis]}`);
                }
            });

        statesGroup.call(toolTip);

        statesGroup.on("mouseover", function (data) {
            toolTip.show(data)
                .duration(1000)
                ;

        })
            // onmouseout event
            .on("mouseout", function (data, index) {
                toolTip.hide(data);


            });

        return statesGroup;
    }

    d3.csv("../assets/data/data.csv").then((data, err) => {
        if (err) throw err;

        console.log(data)

        data.forEach(d => {
            d.age = +d.age;
            d.healthcare = +d.healthcare;
            d.income = +d.income;
            d.obesity = +d.obesity;
            d.poverty = +d.poverty;
            d.smokes = +d.smokes;
        })

        let xLinearScale = xScale(data);
        let yLinearScale = yScale(data);

        let bottomAxis = d3.axisBottom(xLinearScale)
            .tickSize(-chartHeight)
            .tickFormat(d3.format(".2s"))
            .tickPadding(10);
        let leftAxis = d3.axisLeft(yLinearScale)
            .tickSize(-chartWidth)
            .tickPadding(10);;

        // append x axis
        let xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        // append y axis
        let yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);


        let circlesGroup = chartGroup.selectAll("circle")
            .data(data)
            .enter()
            .append('circle')
            .attr("cx", d => xLinearScale(xValue(d)))
            .attr("cy", d => yLinearScale(yValue(d)))
            .attr("r", 9.5);

        let statesGroup = chartGroup.selectAll("div").data(data)
            .enter().append("text")
            .attr("x", d => xLinearScale(xValue(d)))
            .attr("y", d => yLinearScale(yValue(d)))
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .text(d => labels(d))
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .style("fill", "#ffffff")

        const xAxisLabelsG = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

        var incomeLabel = xAxisLabelsG.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "income") // value to grab for event listener
            .classed("active", true)
            .text("Household Income (Median)");

        var povertyLabel = xAxisLabelsG.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "poverty") // value to grab for event listener
            .classed("inactive", true)
            .text("In Poverty (%)");

        var ageLabel = xAxisLabelsG.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");

        const yAxisLabelsG = chartGroup.append("g")
            .attr("transform", "rotate(-90)")


        var healthcareLabel = yAxisLabelsG.append("text")
            .attr("y", 0 - margin.left + 65)
            .attr("x", 0 - (chartHeight / 2))
            .attr("value", "healthcare") // value to grab for event listener
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokesLabel = yAxisLabelsG.append("text")
            .attr("y", 0 - margin.left + 45)
            .attr("x", 0 - (chartHeight / 2))
            .attr("value", "smokes") // value to grab for event listener
            .classed("inactive", true)
            .text("Smokes (%)");

        var obeseLabel = yAxisLabelsG.append("text")
            .attr("y", 0 - margin.left + 25)
            .attr("x", 0 - (chartHeight / 2))
            .attr("value", "obesity") // value to grab for event listener
            .classed("inactive", true)
            .text("Obese (%)");

        statesGroup = updateToolTip(chosenXAxis, chosenYAxis, statesGroup);

        // x axis labels event listener
        xAxisLabelsG.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {
                    chosenXAxis = value;

                    console.log(chosenXAxis)

                    xLinearScale = xScale(data);

                    // updates x axis with transition
                    xAxis = renderXAxis(xLinearScale, xAxis);
                    circlesGroup = renderCirclesX(circlesGroup, xLinearScale);
                    statesGroup = renderStatesX(statesGroup, xLinearScale);
                    statesGroup = updateToolTip(chosenXAxis, chosenYAxis, statesGroup);


                    if (chosenXAxis === "income") {
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenXAxis === "poverty") {
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }


                }
            })
        yAxisLabelsG.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");

                if (value !== chosenYAxis) {
                    chosenYAxis = value;

                    console.log(chosenYAxis)

                    yLinearScale = yScale(data);

                    // updates x axis with transition
                    yAxis = renderYAxis(yLinearScale, yAxis);
                    circlesGroup = renderCirclesY(circlesGroup, yLinearScale);
                    statesGroup = renderStatesY(statesGroup, yLinearScale);
                    statesGroup = updateToolTip(chosenXAxis, chosenYAxis, statesGroup);


                    if (chosenYAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obeseLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenYAxis === "smokes") {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obeseLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obeseLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }



                }
            })



    })
}

makeGraph()

d3.select(window).on("resize", makeGraph);


    // const render = (data, xAxisV, yAxisV) => {

    //     console.log(data)

    //     const title = "Test";
    //     const xValue = d => d[xAxisV];
    //     const xAxisPoverty = "In Poverty (%)";
    //     const xAxisAge = "Age (Median)";
    //     const xAxisIncome = "Household Income (Median)";
    //     const yValue = d => d[yAxisV];
    //     const yAxisObese = "Obese (%)";
    //     const yAxisHealthcare = "Lacks Healthcare (%)";
    //     const yAxisSmokes = "Smokes(%)";
    //     const labels = d => d.abbr;


    //     const xScale = d3.scaleLinear()
    //         .domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1])
    //         .range([0, chartWidth])
    //         .nice();

    //     const yScale = d3.scaleLinear()
    //         .domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1])
    //         .range([chartHeight, 0])
    //         .nice();

    //     var chartGroup = svg.append("g")
    //         .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //     var xAxis = d3.axisBottom(xScale)
    //         .tickSize(-chartHeight)
    //         .tickFormat(d3.format(".2s"))
    //         .tickPadding(10);
    //     var yAxis = d3.axisLeft(yScale)
    //         .tickSize(-chartWidth)
    //         .tickPadding(10);



    //     const xAxisG = chartGroup.append("g")
    //         .classed("axis", true)
    //         .attr("transform", "translate(0, " + chartHeight + ")")
    //         .call(xAxis);

    //     const yAxisG = chartGroup.append("g")
    //         .classed("axis", true)
    //         .call(yAxis)

    //     yAxisG.append('text')
    //         .attr('class', 'axis-label')
    //         .attr('y', -margin.left / 1.6 - 20)
    //         .attr('x', -chartHeight / 2)
    //         .attr('fill', 'black')
    //         .attr('transform', `rotate(-90)`)
    //         .attr('text-anchor', 'middle')
    //         .text(yAxisObese)
    //         .on('mouseover', function (d) {
    //             d3.select(this).style('fill', 'black');
    //         })
    //         .on('mouseout', function (d) {
    //             d3.select(this).style('fill', '#8e8883');
    //         })

    //     yAxisG.append('text')
    //         .attr('class', 'axis-label')
    //         .attr('y', -margin.left / 1.6)
    //         .attr('x', -chartHeight / 2)
    //         .attr('fill', 'black')
    //         .attr('transform', `rotate(-90)`)
    //         .attr('text-anchor', 'middle')
    //         .text(yAxisSmokes)
    //         .on('mouseover', function (d) {
    //             d3.select(this).style('fill', 'black');
    //         })
    //         .on('mouseout', function (d) {
    //             d3.select(this).style('fill', '#8e8883');
    //         })

    //     yAxisG.append('text')
    //         .attr('class', 'axis-label')
    //         .attr('y', -margin.left / 1.6 + 20)
    //         .attr('x', -chartHeight / 2)
    //         .attr('fill', 'black')
    //         .attr('transform', `rotate(-90)`)
    //         .attr('text-anchor', 'middle')
    //         .text(yAxisHealthcare)
    //         .on('mouseover', function (d) {
    //             d3.select(this).style('fill', 'black');
    //         })
    //         .on('mouseout', function (d) {
    //             d3.select(this).style('fill', '#8e8883');
    //         })

    //     xAxisG.append('text')
    //         .attr('class', 'axis-label')
    //         .attr('y', margin.bottom / 1.6)
    //         .attr('x', chartWidth / 2)
    //         .attr('fill', 'black')
    //         .attr('text-anchor', 'middle')
    //         .text(xAxisPoverty)
    //         .on('mouseover', function (d) {
    //             d3.select(this).style('fill', 'black');
    //         })
    //         .on('mouseout', function (d) {
    //             d3.select(this).style('fill', '#8e8883');
    //         })

    //     xAxisG.append('text')
    //         .attr('class', 'axis-label')
    //         .attr('y', margin.bottom / 1.6 + 20)
    //         .attr('x', chartWidth / 2)
    //         .attr('fill', 'black')
    //         .attr('text-anchor', 'middle')
    //         .text(xAxisAge)
    //         .on('mouseover', function (d) {
    //             d3.select(this).style('fill', 'black');
    //         })
    //         .on('mouseout', function (d) {
    //             d3.select(this).style('fill', '#8e8883');
    //         })

    //     xAxisG.append('text')
    //         .attr('class', 'axis-label')
    //         .attr('y', margin.bottom / 1.6 - 20)
    //         .attr('x', chartWidth / 2)
    //         .attr('fill', 'black')
    //         .attr('text-anchor', 'middle')
    //         .text(xAxisIncome)
    //         .on('mouseover', function (d) {
    //             d3.select(this).style('fill', 'black');
    //         })
    //         .on('mouseout', function (d) {
    //             d3.select(this).style('fill', '#8e8883');
    //         })

    //     chartGroup.selectAll("circle").data(data)
    //         .enter().append('circle')
    //         .attr("cx", d => xScale(xValue(d)))
    //         .attr("cy", d => yScale(yValue(d)))
    //         .attr("r", 8.5)


    //     chartGroup.selectAll("span").data(data)
    //         .enter().append("text")
    //         .attr("x", d => xScale(xValue(d)))
    //         .attr("y", d => yScale(yValue(d)))
    //         .attr("text-anchor", "middle")
    //         .attr("dominant-baseline", "central")
    //         .text(d => labels(d))
    //         .attr("font-size", "10px")
    //         .attr("font-weight", "bold")
    //         .style("fill", "#ffffff")

    //     chartGroup.append('text')
    //         .attr('class', 'title')
    //         .attr("x", chartWidth / 2)
    //         .attr("text-anchor", "middle")
    //         .attr('y', -10)
    //         .text(title);


    // }

    // d3.csv("../assets/data/data.csv").then(data => {

    //     data.forEach(d => {
    //         d.age = +d.age;
    //         d.healthcare = +d.healthcare;
    //         d.income = +d.income;
    //         d.obesity = +d.obesity;
    //         d.poverty = +d.poverty;
    //         d.smokes = +d.smokes;
    //     })

    //     render(data, "income", "healthcare")

    //     d3.select






    //     // Append an SVG group element to the SVG area, create the bottom axis inside of it
    //     // Translate the bottom axis to the bottom of the page
