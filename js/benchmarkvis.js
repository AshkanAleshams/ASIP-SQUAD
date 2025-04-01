/**
 * Visualization for LLM benchmarks
 */

class BenchmarkVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = _data;
        this.filteredData = null;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 300, right: 0, bottom: 10, left: 0 };

        (vis.width =
            document.getElementById(vis.parentElement).getBoundingClientRect()
                .width -
            vis.margin.left -
            vis.margin.right),
            (vis.height =
                document
                    .getElementById(vis.parentElement)
                    .getBoundingClientRect().width -
                vis.margin.top -
                vis.margin.bottom);

        vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr(
                "transform",
                "translate(" + vis.margin.left + "," + vis.margin.top + ")"
            );

        vis.radius = 200;
        const totalCircleWidth = 3 * (2 * vis.radius);
        const totalSpacing = vis.width - totalCircleWidth;
        vis.spacing = totalSpacing / 4;

        vis.barGroup = vis.svg
            .append("g")
            .attr("class", "bar-group")
            .attr(
                "transform",
                `translate(${vis.width / 2}, ${vis.height / 4})`
            );

        // init the benchmark circle
        vis.svg
            .append("circle")
            .attr("class", "benchmark-circle")
            .attr("cx", vis.width / 2)
            .attr("cy", vis.height / 4)
            .attr("r", vis.radius)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 2);

        // put in the middle of the circle
        d3.select("#benchmark-dropdown")
            .style("left", `${vis.width / 2 + 10}px`)
            .style("top", `${vis.height / 4 + 350}px`)
            .style("transform", "translate(-50%, -50%)")
            .style("position", "absolute");

        (vis.innerRadius = vis.radius),
            (vis.outerRadius = Math.min(vis.width, vis.height) / 2);

        vis.x = d3
            .scaleBand()
            .range([0, 2 * Math.PI])
            .padding(0.01);
        vis.y = d3.scaleRadial().range([vis.innerRadius, vis.outerRadius]);

        vis.color = d3.scaleSequential(d3.interpolateCool);

        // append tooltip
        vis.tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", "benchmark-tooltip");

        vis.brushWidth = document.getElementById("data-slider").clientWidth;

        vis.dataSlider = d3
            .select("#data-slider")
            .append("svg")
            .attr("width", vis.brushWidth)
            .attr("height", 50);

        vis.brush = d3
            .brushX()
            .extent([
                [0, 0],
                [vis.brushWidth, 50],
            ])
            .on("brush end", function (event) {
                if (event.selection) {
                    vis.selectionChanged(
                        event.selection.map(vis.xBrush.invert)
                    );
                } else {
                    vis.selectionChanged([0, vis.brushWidth]);
                }
            });

        vis.dataSlider.append("g").attr("class", "brush").call(vis.brush);

        // clear brush button
        vis.clearButton = d3.select("#clear-btn")
            .style("display", "none")
            .on("click", function () {
                vis.clearSlider();
            });

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // clean data
        vis.data.forEach((d) => {
            d.params = d["#Params (B)"];
            d.co2cost = d["CO cost (kg)"];
            d.average = d.Average;
            d.model = d["eval_name"];
            d.official = d["Official Providers"];
        });

        vis.data = vis.data.filter((d) => d.official === true);
        vis.displayData = vis.data;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        console.log("updateVis");

        if (vis.filteredData) {
            vis.clearButton.style("display", "block");
            vis.displayData = [...vis.filteredData];
        } else {
            vis.displayData = [...vis.data];
        }

        if (benchmarkSorted) {
            vis.displayData.sort(
                (a, b) => b[selectedCategory] - a[selectedCategory]
            );
        }

        console.log(vis.displayData.length);

        vis.xBrush = d3
            .scaleLinear()
            .domain([
                d3.min(vis.data, (d) => d[selectedCategory]),
                d3.max(vis.data, (d) => d[selectedCategory]),
            ])
            .range([0, vis.brushWidth]);

        vis.xScale = vis.x.domain(vis.displayData.map((d) => d.model));
        vis.yScale = vis.y.domain([
            0,
            d3.max(vis.displayData, (d) => d[selectedCategory]),
        ]);

        vis.arc = d3
            .arc()
            .innerRadius(vis.innerRadius)
            .outerRadius((d) => vis.yScale(d[selectedCategory]))
            .startAngle((d) => vis.xScale(d.model))
            .endAngle((d) => vis.xScale(d.model) + vis.x.bandwidth())
            .padAngle(0.01)
            .padRadius(vis.height / 2);

        vis.color.domain([
            0,
            d3.max(vis.displayData, (d) => d[selectedCategory]),
        ]);

        // draw bars
        let bars = vis.barGroup
            .selectAll("path")
            .data(vis.displayData, (d) => d.model);

        bars.exit().remove();

        let barsEnter = bars
            .enter()
            .append("path")
            .attr("fill", (d) => vis.color(d[selectedCategory]))
            .attr("stroke", (d) => vis.color(d[selectedCategory]))
            .attr("stroke-width", 2)
            .attr("d", vis.arc)
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke-width", 6);
                d3.selectAll("path").classed("dim", true);
                d3.select(this).classed("dim", false);

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`)
                    .style("display", "inline-block")
                    .html(
                        `
                        <h5>Model: ${d.model}</h5>
                        <strong>Average Benchmark Score:</strong> ${d.average}
                        <br>
                        <strong>CO2 Cost (kg):</strong> ${d.co2cost}
                        <br>
                        <strong>Params:</strong> ${d.params}
                    `
                    );
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", 2);
                d3.selectAll("path").classed("dim", false);

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        bars = barsEnter.merge(bars);

        bars.transition()
            .duration(500)
            .delay((d, i) => i)
            .attrTween("d", function (d) {
                const currentElement = d3.select(this);
                const startOuterRadius =
                    currentElement.attr("_current_radius") || vis.innerRadius;
                const endOuterRadius = vis.yScale(d[selectedCategory]);
                currentElement.attr("_current_radius", endOuterRadius);
                // update heights
                return function (t) {
                    const originalOuterRadius = vis.arc.outerRadius();
                    vis.arc.outerRadius(
                        d3.interpolate(startOuterRadius, endOuterRadius)(t)
                    );

                    const path = vis.arc(d);
                    vis.arc.outerRadius(originalOuterRadius);
                    return path;
                };
            })
            .attr("fill", (d) => vis.color(d[selectedCategory]))
            .attr("stroke", (d) => vis.color(d[selectedCategory]));
    }

    clearSlider() {
        let vis = this;
        vis.dataSlider.select(".brush").call(vis.brush.move, null);
        vis.filteredData = null;
        vis.clearButton.style("display", "none");
        vis.updateVis();
    }

    selectionChanged(selectionDomain) {
        let vis = this;

        vis.filteredData = vis.data.filter(
            (d) =>
                d[selectedCategory] >= selectionDomain[0] &&
                d[selectedCategory] <= selectionDomain[1]
        );

        vis.updateVis();
    }
}
