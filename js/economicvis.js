// const FILL_COLOR = "#f8f9fa";
// const VIS_HEIGHT = 1000;
class EconomicVis {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 30, right: 50, bottom: 115, left: 60 };

        (vis.width =
            document.getElementById(vis.parentElement).getBoundingClientRect()
                .width -
            vis.margin.left -
            vis.margin.right),
            (vis.height = 750 - vis.margin.top - vis.margin.bottom);

        vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append("svg")
            .attr("width", vis.width + vis.margin.left)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr(
                "transform",
                "translate(" + vis.margin.left + "," + vis.margin.top + ")"
            );

        // Scales
        vis.x = d3.scaleBand().rangeRound([0, vis.width]).paddingInner(0.1);

        vis.y = d3.scaleLinear().range([vis.height, 0]);

        vis.colorScale = d3
            .scaleOrdinal()
            .domain([
                "OpenAI",
                "Anthropic",
                "Google",
                "DeepSeek",
                "Cerebras",
                "Cohere",
            ]) // Add more providers if needed
            .range([
                "#a790f0",
                "#39cadc",
                "#ff6f61",
                "#f5a623",
                "#7eced3",
                "#d6e9ff",
            ]);

        // Append x-axis
        vis.xAxis = d3.axisBottom().scale(vis.x);

        // Append y-axis
        vis.yAxis = d3.axisLeft().scale(vis.y);

        vis.xAxisGroup = vis.svg
            .append("g")
            .style("font-size", "11px")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.yAxisGroup = vis.svg
            .append("g")
            .style("font-size", "14px")
            .attr("class", "axis y-axis")
            .call(vis.yAxis);

        // Y-Axis label
        vis.svg
            .append("text")
            .attr("class", "y-axis-label")
            .attr("id", "economic-y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -(this.height / 2))
            .attr("y", -this.margin.left + 10)
            .attr("font-size", "14px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");

        // append tooltip
        vis.tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .attr("id", "economic-tooltip");

        vis.bars = vis.svg.append("g").attr("class", "bars");

        //title
        vis.svg
            .append("g")
            .attr("class", "title")
            .attr("id", "compare-title")
            .append("text")
            .text("Comparison of the cost of LLMs")
            .attr("transform", `translate(${vis.width / 2}, 0)`)
            .attr("font-size", "20px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        
        vis.displayData = [];
        vis.origData = [];
        vis.displayData = vis.data;
        // multiply by 1M to get the price per 1M tokens and round to 2 decimal places
        vis.displayData = vis.displayData.map((d) => ({
            ...d,
            price_per_input_token: d.price_per_input_token * 1_000_000,
            price_per_output_token: d.price_per_output_token * 1_000_000,
        }));

        vis.origData = vis.displayData;
        this.updateVis();
    }

    updateVis() {
        let vis = this;

        // get the currently selected option
        let yOption = d3.select("#token-type").property("value");

        // Update y-axis label
        d3.select("#economic-y-axis-title").text(
            yOption == "price_per_input_token"
                ? "Price of input tokens ($/ 1M tokens)"
                : "Price of output tokens ($/ 1M tokens)"
        );

        // sort
        if (economicSorted) {
            vis.displayData.sort((a, b) => b[yOption] - a[yOption]);
        } else {
            vis.displayData = [...vis.origData];
        }

        // Update domains
        vis.x.domain(vis.displayData.map((d) => d.model_id));
        vis.y.domain([0, d3.max(vis.displayData, (d) => d[yOption])]); // dynamic

        // Update bars
        let bars = vis.bars
            .selectAll("rect")
            .data(vis.displayData, (d) => d.model_id);

        // Enter
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .merge(bars)
            .attr("fill", (d) => vis.colorScale(d.provider))
            .attr("width", vis.x.bandwidth())
            .on("mouseover", function (event, d) {
                d3.select(this).attr("stroke-width", 6);
                d3.selectAll("rect").classed("dim", true);
                d3.select(this).classed("dim", false);

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px").html(`
                        <h5>${d.model_name}</h5>
                        <strong>Provider:</strong> ${d.provider}
                        <br>
                        <strong>Throughput:</strong> ${d.throughput}
                        <br>
                        <strong>Latency</strong> ${d.latency}
                        <br>
                        <strong>Price per input token ($/ 1M tokens):</strong> $${d.price_per_input_token.toFixed(
                            2
                        )}
                        <br>
                        <strong>Price per output token ($/ 1M tokens):</strong> $${d.price_per_output_token.toFixed(
                            2
                        )}

                    `);
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", 2);
                d3.selectAll("rect").classed("dim", false);
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .duration(1000)
            .attr("x", (d) => vis.x(d.model_id))
            .attr("y", (d) => vis.y(d[yOption]))
            .attr("height", (d) => vis.height - vis.y(d[yOption]));

        // Exit
        bars.exit().remove();

        // Update axes ticks and labels
        vis.xAxisGroup
            .transition()
            .duration(1000)
            .call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .text(
                (d) =>
                    vis.displayData.find((data) => data.model_id === d)
                        ?.model_name || d
            );
        vis.yAxisGroup.call(vis.yAxis);
    }
}
