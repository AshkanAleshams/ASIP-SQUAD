
// global 
let barriersToEntryVis, benchmarkVis, economicVis, performanceVis;

// Date parser to convert strings to date objects
let parseDate = d3.timeParse("%Y-%m-%d");


// Load data
let promises = [
    d3.json("data/barriers.json"), 
    d3.json("data/LLMStats_ChavezTamales_Data.json")
];

Promise.all(promises)
    .then(function (data) {
        console.log(data);
        renderVisualizations(data);
    })
    .catch(function (error) {
        console.log(error);
    });

function renderVisualizations(data) {
   
    BarrierData = data[0];
    LLMStatsData = data[1];

    barriersToEntryVis = new BarriersVis("barriers-vis", BarrierData);
    // let benchmarkVis = new BenchmarkVis("benchmark-vis", [1, 2, 3]);
    economicVis = new EconomicVis("economic-vis", LLMStatsData);
    performanceVis = new PerformanceVis("performance-vis", LLMStatsData);


}

function updateEconomicVis(){
    economicVis.wrangleData();
}