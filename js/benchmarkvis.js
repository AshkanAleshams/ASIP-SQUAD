/**
 * Visualization for LLM benchmarks
 */
const BM_FILL_COLOR = "#f8f9fa";

class BenchmarkVis {
    constructor(_parentElement, _data, _categories) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = _data;
        this.categories = _categories;
        this.averageData = [];
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 0, bottom: 10, left: 0 };

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
            .attr(
                "width",
                vis.width + vis.margin.left,
                vis.height + vis.margin.right
            )
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr(
                "transform",
                "translate(" + vis.margin.left + "," + vis.margin.top + ")"
            );

        vis.radius = 95;
        const numCircles = vis.categories.length;
        const totalCircleWidth = numCircles * (2 * vis.radius);
        const totalSpacing = vis.width - totalCircleWidth;
        vis.spacing = totalSpacing / (numCircles + 1);

        // draw bars
        vis.avgBars = vis.svg.append("g").selectAll("path");
        vis.paramBars = vis.svg.append("g").selectAll("path");
        vis.co2Bars = vis.svg.append("g").selectAll("path");

        // init category circles
        vis.circles = vis.svg
            .selectAll(".benchmark-circle")
            .data(vis.categories)
            .enter()
            .append("circle")
            .attr("class", "benchmark-circle")
            .attr(
                "cx",
                (d, i) =>
                    vis.spacing +
                    vis.radius +
                    i * (2 * vis.radius + vis.spacing)
            )
            .attr("cy", vis.height / 4)
            .attr("r", vis.radius)
            .attr("fill", BM_FILL_COLOR)
            .style("z-index", 10);

        vis.svg
            .selectAll(".benchmark-text")
            .data(vis.categories)
            .enter()
            .append("text")
            .attr("class", "benchmark-text")
            .attr(
                "x",
                (d, i) =>
                    vis.spacing +
                    vis.radius +
                    i * (2 * vis.radius + vis.spacing)
            )
            .attr("y", vis.height / 4)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("fill", "black")
            .text((d) => d);

        (vis.innerRadius = 80),
            (vis.outerRadius = Math.min(vis.width, vis.height) / 2);

        vis.x = d3.scaleBand().range([0, 2 * Math.PI]).padding(0.05);
        vis.y = d3.scaleRadial().range([vis.innerRadius, vis.outerRadius]);

        vis.avgColor = d3
            .scaleSequential(d3.interpolateInferno)

        vis.paramColor = d3.scaleSequential(d3.interpolateViridis);

        vis.co2Color = d3.scaleSequential(d3.interpolateMagma);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // // // sort data
        // vis.data = vis.data.sort((a, b) => d3.ascending(a.Average, b.Average));
        // console.log(vis.data);

        // clean data
        vis.displayData.forEach((d) => {
            d.params = d["#Params (B)"];
            d.co2cost = d["CO cost (kg)"];
        });

        vis.displayData = vis.displayData.slice(0, 75);
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.scale = 0.4

        vis.avgX = vis.x.domain(vis.displayData.map((d) => d["eval_name"]));
        vis.avgY = vis.y.domain([0, d3.max(vis.displayData, (d) => d.Average)]);

        vis.avgArc = d3
            .arc()
            .innerRadius(vis.innerRadius)
            .outerRadius((d) => vis.avgY(d.Average) * vis.scale)
            .startAngle((d) => vis.avgX(d["eval_name"]))
            .endAngle((d) => vis.avgX(d["eval_name"]) + vis.x.bandwidth())
            .padAngle(0.01)
            .padRadius(vis.height / 2);

        vis.avgColor.domain([0, d3.max(vis.displayData, (d) => d.Average)]);

        vis.avgBars
            .data(vis.displayData)
            .enter()
            .append("path")
            .attr("fill", (d) => vis.avgColor(d.Average))
            .attr("stroke", (d) => vis.avgColor(d.Average))
            .merge(vis.avgBars)
            .attr("d", vis.avgArc)
            .attr(
                "transform",
                `translate(${
                    vis.spacing +
                    vis.radius +
                    0 * (2 * vis.radius + vis.spacing)
                }, ${vis.height / 4})`
            );

        vis.paramX = vis.x.domain(vis.displayData.map((d) => d["eval_name"]));
        vis.paramY = vis.y.domain([0, d3.max(vis.displayData, (d) => d.params)]);

        vis.paramArcs = d3
            .arc()
            .innerRadius(vis.innerRadius)
            .outerRadius((d) => vis.paramY(d.params) * vis.scale)
            .startAngle((d) => vis.paramX(d["eval_name"]))
            .endAngle((d) => vis.paramX(d["eval_name"]) + vis.x.bandwidth())
            .padAngle(0.01)
            .padRadius(vis.height / 2);

        vis.paramColor.domain([0, d3.max(vis.displayData, (d) => d.params)]);

        vis.paramBars
            .data(vis.displayData)
            .enter()
            .append("path")
            .attr("fill", (d) => vis.paramColor(d.params))
            .attr("stroke", (d) => vis.paramColor(d.params))
            .merge(vis.paramBars)
            .attr("d", vis.paramArcs)
            .attr(
                "transform",
                `translate(${
                    vis.spacing +
                    vis.radius +
                    1 * (2 * vis.radius + vis.spacing)
                }, ${vis.height / 4})`
            );

        vis.co2X = vis.x.domain(vis.displayData.map((d) => d["eval_name"]));
        vis.co2Y = vis.y.domain([0, d3.max(vis.displayData, (d) => d.co2cost)]);

        vis.arc = d3
            .arc()
            .innerRadius(vis.innerRadius)
            .outerRadius((d) => vis.co2Y(d.co2cost) * vis.scale)
            .startAngle((d) => vis.co2X(d["eval_name"]))
            .endAngle((d) => vis.co2X(d["eval_name"]) + vis.x.bandwidth())
            .padAngle(0.01)
            .padRadius(vis.height / 2);

        vis.co2Color.domain([0, d3.max(vis.displayData, (d) => d.co2cost)]);

        vis.co2Bars
            .data(vis.displayData)
            .enter()
            .append("path")
            .attr("fill", (d) => vis.co2Color(d.co2cost))
            .attr("stroke", (d) => vis.co2Color(d.co2cost))
            .merge(vis.co2Bars)
            .attr("d", vis.arc)
            .attr(
                "transform",
                `translate(${
                    vis.spacing +
                    vis.radius +
                    2 * (2 * vis.radius + vis.spacing)
                }, ${vis.height / 4})`
            );
    }
}
