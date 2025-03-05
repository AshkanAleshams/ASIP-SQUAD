/**
 * Visualization for barriers to entry
 */
const FILL_COLOR = "#A890F0";

class BarriersVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 0, right: 10, bottom: 0, left: 10 };

        (vis.width =
            document.getElementById(vis.parentElement).getBoundingClientRect()
                .width -
            vis.margin.left -
            vis.margin.right),
            (vis.height = 1000 - vis.margin.top - vis.margin.bottom);

        console.log(vis.width);
        console.log(vis.height);

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

        // base circle
        vis.svg
            .append("circle")
            .attr("cx", vis.width / 2)
            .attr("cy", vis.height / 2)
            .attr("r", 100)
            .attr("fill", FILL_COLOR);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.data = vis.data[0].barriers;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        const center = { x: vis.width / 2, y: vis.height / 2 };
        const radius = 250;
        const numBarriers = vis.data.length;
        const angleStep = (2 * Math.PI) / numBarriers;

        // connecting ines
        vis.lines = vis.svg
            .selectAll(".lines")
            .data(vis.data)
            .enter()
            .append("line")
            .attr("class", "lines")
            .attr("x1", center.x)
            .attr("y1", center.y)
            .attr("x2", (d, i) => center.x + radius * Math.cos(i * angleStep))
            .attr("y2", (d, i) => center.y + radius * Math.sin(i * angleStep))
            .attr("stroke", FILL_COLOR)
            .attr("stroke-width", 5);

        // outer circles
        vis.circles = vis.svg
            .selectAll(".barriers")
            .data(vis.data)
            .enter()
            .append("circle")
            .attr("class", "barriers")
            .attr("r", 50)
            .attr("cx", (d, i) => center.x + radius * Math.cos(i * angleStep))
            .attr("cy", (d, i) => center.y + radius * Math.sin(i * angleStep))
            .attr("fill", FILL_COLOR)
            .on("mouseover", function (event, d) {
                d3.select(this).transition().duration(200).attr("r", 60);
            })
            .on("mouseout", function (event, d) {
                d3.select(this).transition().duration(200).attr("r", 50);
            });

        vis.accents = vis.svg
            .selectAll(".accents")
            .data(vis.data)
            .enter()
            .append("circle")
            .attr("class", "accents")
            .attr("r", 60)
            .attr("cx", (d, i) => center.x + radius * Math.cos(i * angleStep))
            .attr("cy", (d, i) => center.y + radius * Math.sin(i * angleStep))
            .attr("stroke", FILL_COLOR)
            .attr("stroke-dasharray", "4,4")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        vis.labels = vis.svg
            .selectAll(".labels")
            .data(vis.data)
            .enter()
            .append("text")
            .attr("class", "labels")
            .attr("x", (d, i) => center.x + radius * Math.cos(i * angleStep))
            .attr("y", (d, i) => center.y + radius * Math.sin(i * angleStep))
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .text((d) => d.name)
            .attr("fill", "white")
            .attr("font-size", 14);
    }
}
