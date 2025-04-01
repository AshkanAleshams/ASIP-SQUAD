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

        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };

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

        vis.tooltip = d3.select("#barriers-tooltip");

        vis.nodeRadius = 60;

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.displayData = vis.data.barriers;

        vis.nodes = vis.displayData.map((d, i) => ({
            id: i + 1,
            name: d.name,
            description: d.description,
        }));

        vis.nodes.unshift({ id: 0, name: "", description: "" });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        const center = { x: vis.width / 2, y: vis.height / 2 };
        const radius = 250;
        const numBarriers = vis.nodes.length - 1;
        const angleStep = (2 * Math.PI) / numBarriers;

        // set node positions around the central node
        vis.nodes.forEach((node, i) => {
            if (i === 0) {
                node.x = center.x;
                node.y = center.y;
            } else {
                node.x = center.x + radius * Math.cos((i - 1) * angleStep);
                node.y = center.y + radius * Math.sin((i - 1) * angleStep);
            }
        });

        const lines = vis.nodes.slice(1).map((node) => ({
            source: 0,
            target: node.id,
        }));

        const simulation = d3
            .forceSimulation(vis.nodes)
            .force("link", d3.forceLink(lines).distance(350))
            .force("charge", d3.forceManyBody().strength(-350))
            .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
            .on("tick", ticked);

        // add connecting lines
        vis.svg
            .selectAll(".line")
            .data(lines)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("stroke", FILL_COLOR)
            .attr("stroke-width", 2)
            .attr("fill", "none");

        const node = vis.svg
            .selectAll(".node")
            .data(vis.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .call(
                d3
                    .drag()
                    .on("start", onDragStart)
                    .on("drag", dragged)
                    .on("end", onDragEnd)
            );

        node.append("circle")
            .attr("id", (d, i) => `barriers-${i}`)
            .attr("r", vis.nodeRadius)
            .attr("fill", FILL_COLOR)
            .attr("stroke", FILL_COLOR);

        function onMouseOver(event, d) {
            if (d.id === 0) {
                return;
            }
            d3.select(`#barriers-${d.id}`)
                .transition()
                .duration(200)
                .attr("r", vis.nodeRadius + 10);
            vis.tooltip
                .style("display", "block")
                .html(`<h6>${d.name}</h6><p>${d.description}</p>`)
                .style("left", event.pageX + 15 + "px")
                .style("top", event.pageY - 10 + "px");
            vis.tooltip.transition().duration(200).style("opacity", 1);
        }

        function onMouseOut(event, d) {
            vis.tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
                .on("end", function () {
                    vis.tooltip.style("display", "none");
                });
            d3.select(`#barriers-${d.id}`)
                .transition()
                .duration(200)
                .attr("r", vis.nodeRadius);
        }

        // add dotted line accent
        vis.accents = node
            .append("circle")
            .attr("r", vis.nodeRadius + 10)
            .attr("fill", "none")
            .attr("stroke", FILL_COLOR)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,4");

        // add SVGs
        node.filter((d) => d.id === 0)
            .append("g")
            .html(keySVG)
            .attr("transform", "translate(-30, -30)");

        node.filter((d) => d.id !== 0)
            .append("g")
            .html(lockSVG)
            .attr("transform", "translate(-30, -30)");

        // add click area on top of the visible nodes
        node.append("circle")
            .attr("class", "click-area")
            .attr("r", vis.nodeRadius + 10)
            .attr("fill", "transparent")
            .attr("stroke", "transparent")
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut);

        // add labels
        node.append("text")
            .attr("dx", 75)
            .attr("dy", 10)
            .text((d) => d.name)
            .attr("fill", "white");

        function ticked() {
            vis.svg.selectAll(".line").attr("d", (d) => {
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy);
                return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
            });

            vis.svg
                .selectAll(".node")
                .attr("transform", (d) => `translate(${d.x},${d.y})`);
        }

        function onDragStart(event, d) {
            if (!event.active) {
                simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function onDragEnd(event, d) {
            if (!event.active) {
                simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        }
    }
}
