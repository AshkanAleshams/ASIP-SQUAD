// const FILL_COLOR = "#f8f9fa";
// const VIS_HEIGHT = 1000;
class PerformanceVis {
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
            (vis.height = 750 - vis.margin.top - vis.margin.bottom);
            console.log(document.getElementById(vis.parentElement).getBoundingClientRect().width);
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

        const radius = 95
        const numCircles = vis.data.length;
        const totalCircleWidth = numCircles * (2 * radius);
        const totalSpacing = vis.width - totalCircleWidth;
        const spacing = totalSpacing / (numCircles + 1);

        // init benchmark circles
        vis.svg
            .selectAll(".benchmark-circle")
            .data(vis.data)
            .enter()
            .append("circle")
            .attr("class", "benchmark-circle")
            .attr("cx", (d, i) => spacing + radius + i * (2 * radius + spacing))
            .attr("cy", vis.height / 4)
            .attr("r", radius)
            .attr("fill", "#f8f9fa");

        vis.wrangleData();
    }

    wrangleData() {}

    updateVis() {}
}
