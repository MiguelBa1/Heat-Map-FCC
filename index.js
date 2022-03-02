(async function getData() {
    let res = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    let {baseTemperature, monthlyVariance} = await res.json()

    const margin = { top: 50, bottom: 50, left: 75, right: 50 }
    const width = 1200;
    const height = 500;

    let svg = d3.select("main")
        .append("svg")
        .attr("height", height+150)
        .attr("width", width)
        .attr("viewbox", [0, 0, width, height])

    let start = new Date(d3.min(monthlyVariance, d=>d["year"]), 0)
    let end = new Date(d3.max(monthlyVariance, d=>d["year"]), 0)
    let xTime = d3.scaleTime()
        .domain([start, end])
        .range([margin.left, width - margin.right])

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .attr("id", "x-axis")
        .call(d3.axisBottom(xTime).tickFormat(d3.utcFormat("%Y")).ticks(d3.timeYear.every(10)))

    let months = (d3.timeMonth.range(new Date(2000, 0, 1), new Date(2000, 12, 1))).reverse()
    let yScale = d3.scaleBand()
        .domain(months)
        .range([height - margin.bottom, margin.top])

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .attr("id", "y-axis")
        .call(d3.axisLeft(yScale).tickFormat(d3.utcFormat("%B")))

    let minVariance = d3.min(monthlyVariance, d=>d["variance"])
    let maxVariance = d3.max(monthlyVariance, d=>d["variance"])

    let colorPalete = ['rgb(69, 117, 180)', 'rgb(116, 173, 209)',
                'rgb(171, 217, 233)', 'rgb(224, 243, 248)',
                'rgb(255, 255, 191)', 'rgb(254, 224, 144)',
                'rgb(253, 174, 97)', 'rgb(244, 109, 67)',
                'rgb(215, 48, 39)']

    let myColor = d3.scaleQuantize()
        .domain([minVariance, maxVariance])
        .range(colorPalete);

    let tooltip = d3.select("main")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("opacity", "0")

    let mouseover = (data) => {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return tooltip
            .style("top", (d3.event.pageY)-100 + "px")
            .style("left", (d3.event.pageX)-50 + "px")
            .style("opacity", "1")
            .attr("data-year", data["year"])
            .html(`${data["year"]} - ${monthNames[data["month"]]}<br>${baseTemperature - data["variance"]}<br>${data["variance"]}`)
    }

    let mouseleave = (d) => tooltip.style("opacity", "0")

    svg.append("g")
        .selectAll("rect")
        .data(monthlyVariance)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-month", d => d["month"]-1)
        .attr("data-year", d => d["year"])
        .attr("data-temp", d => baseTemperature - d["variance"])
        .attr("fill", d => myColor(d["variance"]))
        .attr("x", d => xTime(new Date(d["year"], 0)))
        .attr("width", 4)
        .attr("y", d => yScale(new Date(2000, d["month"]-1, 1)))
        .attr("height", yScale.bandwidth())
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)

    let legend = svg.append("g")
        .attr("id", "legend")

    let points = (d3.range(baseTemperature + minVariance, baseTemperature + maxVariance)).map(x=>Math.round(x*100)/100)
    let labelScale = d3.scaleBand()
        .domain(points)
        .rangeRound([margin.left, svg.node().getBBox().width/2]);

    let g1 = legend.append("g")
        .attr("transform", `translate(0, ${height+150 - margin.bottom})`)
        .call(d3.axisBottom(labelScale))

    g1.append("g")
        .selectAll("rect")
        .data(points)
        .enter()
        .append("rect")
        .attr("height", 10)
        .attr("width", labelScale.bandwidth())
        .attr("x", d => labelScale(d))
        .attr("y", -10)
        .attr("fill", d => myColor(d-baseTemperature))
        .attr("stroke", "black")

})()
