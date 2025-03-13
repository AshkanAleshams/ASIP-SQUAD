class CompareVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 30, right: 50, bottom: 100, left: 50 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 750 - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Scales
        vis.x = d3.scaleLinear().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        vis.colorScale = d3.scaleOrdinal()
            .domain(["OpenAI", "Anthropic", "Google", "DeepSeek", "Cerebras", 'Cohere'])
            .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "orange"]);

        // Append x-axis
        vis.xAxis = d3.axisBottom().scale(vis.x);

        // Append y-axis
        vis.yAxis = d3.axisLeft().scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${vis.height})`);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "axis y-axis");

        // X-Axis label
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("id", "comapre-x-axis-title")
            .attr("x", vis.width / 2)
            .attr("y", vis.height + vis.margin.bottom - 10)
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");
            

        // Y-Axis label
        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("id", "compare-y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height / 2)
            .attr("y", -vis.margin.left + 10)
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'compare-tooltip');

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.displayData = vis.data.models.map(d => ({
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
        d3.select("#comapre-x-axis-title").text(tokenType == 'price_per_input_token' ? "Price of input tokens ($/ 1M tokens)" : "Price of output tokens ($/ 1M tokens)");

        // Update y-axis label
        d3.select("#compare-y-axis-title").text(performanceType == 'throughput' ? "Processing speed: throughput / s" : "Response Time: latency (ms)");

        // Update domains
        vis.x.domain([0, d3.max(vis.displayData, d => +d[tokenType])]);
        vis.y.domain([0, d3.max(vis.displayData, d => +d[performanceType])]);

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
                        <h5>${d.model_id}</h5>
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
