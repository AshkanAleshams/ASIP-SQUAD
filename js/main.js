
// global 
let barriersToEntryVis, benchmarkVis, economicVis, performanceVis;

// Date parser to convert strings to date objects
let parseDate = d3.timeParse("%Y-%m-%d");


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


let selectedCategory = "average";

function renderVisualizations(data) {
    BarrierData = data[0];
    LLMStatsData = data[1];
    OpenData = data[2];

    barriersToEntryVis = new BarriersVis("barriers-vis", BarrierData);
    benchmarkVis = new BenchmarkVis("benchmark-vis", OpenData);
    economicVis = new EconomicVis("economic-vis", LLMStatsData);
    performanceVis = new PerformanceVis("performance-vis", LLMStatsData);
}

function onSelectChange() {
    selectedCategory = document.getElementById("benchmark").value;
    benchmarkVis.updateVis();
}

function updateEconomicVis(){
    economicVis.wrangleData();
}