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

        vis.margin = { top: 30, right: 50, bottom: 100, left: 50 };

        (vis.width =
            document.getElementById(vis.parentElement).getBoundingClientRect()
                .width -
            vis.margin.left -
            vis.margin.right),
            (vis.height = 750 - vis.margin.top - vis.margin.bottom);
        console.log(document.getElementById(vis.parentElement).getBoundingClientRect().width);
        vis.svg = d3
            .select(`#${vis.parentElement}`)
            .append("svg")
            .attr(
                "width",
                vis.width + vis.margin.left
            )
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr(
                "transform",
                "translate(" + vis.margin.left + "," + vis.margin.top + ")"
            );


        // Scales
        vis.x = d3.scaleBand()

            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.colorScale = d3.scaleOrdinal()
            .domain(["OpenAI", "Anthropic", "Google", "DeepSeek", "Cerebras", 'Cohere']) // Add more providers if needed
            .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "orange"]); // Ass

        // Append x-axis
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        // Append y-axis
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);


        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + (vis.height) + ")")
            .call(vis.xAxis);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "axis y-axis")

            .call(vis.yAxis);


        // Y-Axis label
        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("id", "economic-y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -(this.height / 2))
            .attr("y", - this.margin.left + 20)
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");




        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.displayData = vis.data.models;
        console.log(vis.displayData);
        this.updateVis();
    }

    updateVis() {
        let vis = this;

        // get the currently selected option
        let yOption = d3.select("#token-type").property("value");

        // Update y-axis label
        d3.select("#economic-y-axis-title").text(yOption == 'price_per_input_token' ? "Price of input tokens ($/ 1M tokens)" : "Price of output tokens ($/ 1M tokens)");

        // sort
        let sortOption = d3.select('#sort-type').property('value');
        if (sortOption === 'sorted') {
            vis.displayData.sort((a, b) => b[yOption] - a[yOption]);
        }


        // Update domains
        vis.x.domain(vis.displayData.map(d => d.model_id));
        vis.y.domain([0, d3.max(vis.displayData, d => d[yOption] * 1_000_000)]); 	// dynamic

        // Update bars
        vis.bars = vis.svg.selectAll("rect").data(vis.displayData, d => d.model_id);

        // Enter 
        vis.bars.enter().append("rect")
            .attr("class", "bar")
            .merge(vis.bars)
            .attr("fill", d => vis.colorScale(d.provider))
            .attr("x", d => vis.x(d.model_id))
            .attr("y", vis.height)
            .attr("height", 0)
            .transition()
            .duration(1000)
            
            .attr("y", d => vis.y(d[yOption] * 1_000_000))
            .attr("width", vis.x.bandwidth())
            .attr("height", d => vis.height - vis.y(d[yOption] * 1_000_000))

        // Exit
        vis.bars.exit().remove();

        // Update axes ticks and labels
        vis.xAxisGroup.call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
        vis.yAxisGroup.call(vis.yAxis);
    }
}
