// Load data
let promises = [
    d3.json("data/barriers.json"), 
    d3.json("data/LLMStats_ChavezTamales_Data.json"),
    d3.json("data/open_data.json")
];

Promise.all(promises)
    .then(function (data) {
        renderVisualizations(data);
    })
    .catch(function (error) {
        console.log(error);
    });

function renderVisualizations(data) {
    BarrierData = data[0];
    LLMStatsData = data[1];
    OpenData = data[2];

    benchmarkCategories = ["Average Benchmark", "Parameters Per Billion", "CO2 Cost"];

    let barriersToEntryVis = new BarriersVis("barriers-vis", BarrierData);
    let benchmarkVis = new BenchmarkVis("benchmark-vis", OpenData, benchmarkCategories);
    let economicVis = new EconomicVis("economic-vis", LLMStatsData);
    let performanceVis = new PerformanceVis("performance-vis", LLMStatsData);
}
