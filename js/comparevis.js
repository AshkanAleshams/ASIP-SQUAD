class CompareVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 30, right: 50, bottom: 100, left: 100 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 750 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        //tile
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'compare-title')
            .append('text')
            .text('Comparison of performance vs cost of LLMs')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr("font-size", "20px")
            .attr("fill", "white")
            .attr('text-anchor', 'middle');

        // Scales
        vis.x = d3.scaleLinear().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        vis.colorScale = d3.scaleOrdinal()
            .domain(["OpenAI", "Anthropic", "Google", "DeepSeek", "Cerebras", 'Cohere'])
            .range(["#a790f0", "#39cadc", "#ff6f61", "#f5a623", "#7eced3", "#d6e9ff"]);

        // Append x-axis
        vis.xAxis = d3.axisBottom().scale(vis.x);

        // Append y-axis
        vis.yAxis = d3.axisLeft().scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .style("font-size", "14px")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${vis.height})`);

        vis.yAxisGroup = vis.svg.append("g")
            .style("font-size", "14px")
            .attr("class", "axis y-axis");

        // X-Axis label
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("id", "compare-x-axis-title")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom - 30)
            .attr("font-size", "16px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");


        // Y-Axis label
        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("id", "compare-y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 30)
            .attr("font-size", "16px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'compare-tooltip');

        // Append brush component here
        vis.brushGroup = vis.svg.append("g").attr("class", "brush");

        // Add zoom component
        vis.xOrig = vis.x; // save original scale

        // vis.resetButton = d3.select("#reset-button");

        vis.zoomFunction = function (event) {
            // vis.resetButton.style("display", "block")
            console.log("zooming");
            let xScaleModified = event.transform.rescaleX(vis.xOrig);
            vis.x = xScaleModified;
            vis.xAxis.scale(vis.x);
            // if (vis.currentBrushRegion) {
            //     vis.brushGroup.call(
            //         vis.brush.move,
            //         vis.currentBrushRegion.map(vis.x)
            //     );
            // }
            vis.updateVis();
        }; // function that is being called when user zooms

        vis.zoom = d3.zoom().on("zoom", vis.zoomFunction).scaleExtent([1, 20]);

        // const resetZoom = () => {
        //     vis.resetButton.style("display", "none");
        //     vis.x = vis.xOrig;
        //     vis.xAxis.scale(vis.x);
        //     vis.updateVis();
        // };

        // vis.resetButton.on("click", function () {
        //     resetZoom();
        // });

        // disable mousedown and drag in zoom, when you activate zoom (by .call)
        vis.xAxisGroup
            .call(vis.zoom)
            .on("mousedown.zoom", null)
            .on("touchstart.zoom", null);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.displayData = vis.data.map(d => ({
            ...d,
            price_per_input_token: (d.price_per_input_token * 1_000_000).toFixed(2),
            price_per_output_token: (d.price_per_output_token * 1_000_000).toFixed(2)
        }));
        this.updateVis();
    }

    updateVis() {
        let vis = this;

        //get the performance type category
        let performanceType = document.getElementById("compare-performance-type").value;

        //get the token type category
        let tokenType = document.getElementById("compare-token-type").value;


        //update the x-axis label
        d3.select("#compare-x-axis-title").text(tokenType == 'price_per_input_token' ? "Price of input tokens ($/ 1M tokens)" : "Price of output tokens ($/ 1M tokens)");

        // Update y-axis label
        d3.select("#compare-y-axis-title").text(performanceType == 'throughput' ? "Processing speed: throughput / s" : "Response Time: latency (ms)");

        // Calculate padding
        let xPadding = (d3.max(vis.displayData, d => +d[tokenType]) - d3.min(vis.displayData, d => +d[tokenType])) * 0.05;
        let yPadding = (d3.max(vis.displayData, d => +d[performanceType]) - d3.min(vis.displayData, d => +d[performanceType])) * 0.05;

        // Update domains with padding
        vis.x.domain([d3.min(vis.displayData, d => +d[tokenType]) - xPadding, d3.max(vis.displayData, d => +d[tokenType]) + xPadding]);
        vis.y.domain([d3.min(vis.displayData, d => +d[performanceType]) - yPadding, d3.max(vis.displayData, d => +d[performanceType]) + yPadding]);
        // Update circles
        vis.circles = vis.svg.selectAll("circle").data(vis.displayData, d => d.model_id);

        // Enter
        vis.circles.enter().append("circle")
            .attr("class", "dot")
            .merge(vis.circles)
            .attr("fill", d => vis.colorScale(d.provider))
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke-width", 2).attr("stroke", "black");
                d3.selectAll("circle").classed("dim", true);
                d3.select(this).classed("dim", false);

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <h5>${d.model_name}</h5>
                        <strong>Provider:</strong> ${d.provider}
                        <br>
                        <strong>Throughput:</strong> ${d.throughput}
                        <br>
                        <strong>Latency:</strong> ${d.latency}
                        <br>
                        <strong>Price per input token ($/ 1M tokens):</strong> $${d.price_per_input_token}
                        <br>
                        <strong>Price per output token ($/ 1M tokens):</strong> $${d.price_per_output_token}
                    `);
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", 0);
                d3.selectAll("circle").classed("dim", false);
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(1000)
            .attr("cx", d => vis.x(d[tokenType]))
            .attr("cy", d => vis.y(d[performanceType]))
            .attr("r", 10);

        // Exit
        vis.circles.exit().remove();

        // Update axes ticks and labels
        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);
    }
}
