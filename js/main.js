// Load data
let promises = [d3.json("data/barriers.json")];

Promise.all(promises)
    .then(function (data) {
        renderVisualizations(data);
    })
    .catch(function (error) {
        console.log(error);
    });

function renderVisualizations(data) {
    let barriersToEntry = new BarriersVis("barriers-vis", data);
    let benchmark = new BenchmarkVis("benchmark-vis", [1, 2, 3]);
}
