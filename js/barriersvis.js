/**
 * Visualization for barriers to entry
 */
const FILL_COLOR = "#A890F0";
const VIS_HEIGHT = 1000;

class BarriersVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };

        (vis.width =
            document.getElementById(vis.parentElement).getBoundingClientRect()
                .width -
            vis.margin.left -
            vis.margin.right),
            (vis.height = VIS_HEIGHT - vis.margin.top - vis.margin.bottom);

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
            .attr("class", "base-circle")
            .attr("cx", vis.width / 2)
            .attr("cy", vis.height / 2)
            .attr("r", 95)
            .attr("fill", FILL_COLOR);

        vis.tooltip = d3.select("#barriers-tooltip");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.data = vis.data.barriers;
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

        // add key to base circle on top of lines
        vis.svg
            .append("g")
            .attr("transform", `translate(${center.x - 30}, ${center.y - 30})`)
            .html(keySVG);

        const onMouseOver = function (event, d) {
            const i = vis.data.indexOf(d);
            d3.select(`#barriers-${i}`)
                .transition()
                .duration(200)
                .attr("r", 60);
            vis.tooltip
                .style("display", "block")
                .html(`<h6>${d.name}</h6><p>${d.description}</p>`)
                .style("top", `${event.pageY}px`)
                .style("left", `${event.pageX}px`);
        };

        const onMouseOut = function (event, d) {
            const i = vis.data.indexOf(d);
            d3.select(`#barriers-${i}`)
                .transition()
                .duration(200)
                .attr("r", 50);
            vis.tooltip.style("display", "none");
        };

        // outer circles
        vis.circles = vis.svg
            .selectAll(".barriers")
            .data(vis.data)
            .enter()
            .append("circle")
            .attr("id", (d, i) => `barriers-${i}`)
            .attr("class", "barriers")
            .attr("r", 50)
            .attr("cx", (d, i) => center.x + radius * Math.cos(i * angleStep))
            .attr("cy", (d, i) => center.y + radius * Math.sin(i * angleStep))
            .attr("fill", FILL_COLOR)
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut);

        vis.locks = vis.svg
            .selectAll(".locks")
            .data(vis.data)
            .enter()
            .append("g")
            .attr("id", (d, i) => `locks-${i}`)
            .attr("class", "locks")
            .attr(
                "transform",
                (d, i) =>
                    `translate(${
                        center.x + radius * Math.cos(i * angleStep) - 30
                    }, ${center.y + radius * Math.sin(i * angleStep) - 30})`
            )
            .html(lockSVG)
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut);

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

        const arcPath = d3
            .arc()
            .innerRadius(65)
            .outerRadius(0)
            .startAngle(-Math.PI)
            .endAngle(Math.PI * 2);

        vis.labelArcs = vis.svg
            .selectAll(".label-arcs")
            .data(vis.data)
            .enter()
            .append("path")
            .attr("class", "label-arcs")
            .attr("id", (d, i) => `arc${i}`)
            .attr("d", arcPath)
            .attr(
                "transform",
                (d, i) =>
                    `translate(${
                        center.x + radius * Math.cos(i * angleStep)
                    }, ${center.y + radius * Math.sin(i * angleStep)})`
            )
            .attr("fill", "none");

        vis.labels = vis.svg
            .selectAll(".labels")
            .data(vis.data)
            .enter()
            .append("text")
            .attr("class", "labels")
            .append("textPath")
            .attr("xlink:href", (d, i) => `#arc${i}`)
            .attr("startOffset", "50%")
            .text((d) => d.name)
            .attr("fill", "white")
            .attr("font-size", 14)
            .attr("text-anchor", "middle");
    }
}
