const parseNA = string => (string === 'NA' ? undefined : string);
const parseDate = string => d3.timeParse('%Y-%m-%d')(string);
function type(d){
    const date= parseDate(d.release_date);
    return{
        budget: +d.budget,
        genre: parseNA(d.genre),
        genres: JSON.parse(d.genres).map(d=>d.name),
        homepage: parseNA(d.homepage),
        id: +d.id,
        imdb_id: parseNA(d.imdb_id),
        original_language: parseNA(d.original_language),
        overview: parseNA(d.overview),
        popularity: +d.popularity,
        poster_path: parseNA(d.poster_path),
        production_countries: JSON.parse(d.production_countries),
        release_date: date,
        release_year:date.getFullYear(),
        revenue: +d.revenue,
        runtime: +d.runtime,
        tagline: parseNA(d.tagline),
        title: parseNA(d.title),
        vote_average: +d.vote_average,
        vote_count: +d.vote_count,
    }
}

function filterData(data){
    return data.filter( d => {
        return(
            d.release_year > 1999 && d.release_year < 2010 &&
            d.revenue > 0 && d.budget > 0 && d.genre && d.title
        );
    });
}

function prepareBarChartData(data){
    console.log(data);
    const dataMap = d3.rollup(
        data,
        v => d3.sum(v, leaf => leaf.revenue), 
        d => d.genre 
    );
    const dataArray = Array.from(dataMap, d=>({genre:d[0], revenue:d[1]}));
    return dataArray;
}

function formatTicks(d){
    return d3.format('~s')(d)
    .replace('M','mil')
    .replace('G','bil')
    .replace('T','tri')
}

function setupCanvas(barChartData, movieClean){
    let metric = 'revenue';
    function click(){
    metric = this.dataset.name;
    const thisData = chooseData(metric, movieClean);
    update(thisData);
    }
    d3.selectAll('button').on('click',click);
    function update(data){
    }
    const svg_width = 700;
const svg_height = 500;
const barchart_margin = {top:80,right:80,bottom:40,left:250};
const barchart_width = svg_width - (barchart_margin.left + barchart_margin.right);
const barchart_height = svg_height - (barchart_margin.top + barchart_margin.bottom);
const this_svg = d3.select('.bar-chart-container').append('svg')
                   .attr('width', svg_width).attr('height',svg_height)
                   .append('g')
                   .attr('transform',`translate(${barchart_margin.left},${barchart_margin.top})`);
const xExtent = d3.extent(barChartData, d=>d.revenue);
const xScale_v1 = d3.scaleLinear().domain(xExtent).range([0,barchart_width]);
let xMax = d3.max(barChartData, d=>d.revenue);
const xScale_v2 = d3.scaleLinear().domain([0, xMax]).range([0,barchart_width]);
let xScale_v3 = d3.scaleLinear([0,xMax],[0, barchart_width]);
let yScale = d3.scaleBand().domain(barChartData.map(d=>d.title))
               .rangeRound([0, barchart_height])
               .paddingInner(0.25);
const bars = this_svg.append('g').attr('class','bars');
let header = this_svg.append('g').attr('class','bar-header')
                     .attr('transform',`translate(0,${-barchart_margin.top/2})`)
                     .append('text');
header.append('tspan').text('Top 15 XXX movies');
header.append('tspan').text('Years:2000-2009')
      .attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');
let xAxis = d3.axisTop(xScale_v3).ticks(5).tickFormat(formatTicks)
              .tickSizeInner(-barchart_height).tickSizeOuter(0);
let xAxisDraw = this_svg.append('g').attr('class','x axis');
let yAxis = d3.axisLeft(yScale).tickSize(0);
let yAxisDraw = this_svg.append('g').attr('class','y axis');
yAxisDraw.selectAll('text').attr('dx','-0.6em');
update(barChartData);
function update(data){
    console.log(data);
    xMax = d3.max(data, d=>d[metric]);
    xScale_v3 = d3.scaleLinear([0, xMax],[0,barchart_width]);
    yScale = d3.scaleBand().domain(data.map(d=>d.title))
    .rangeRound([0, barchart_height])
    .paddingInner(0.25);
    const defaultDelay = 1000
    const transitionDelay = d3.transition().duration(defaultDelay);
    xAxisDraw.transition(transitionDelay).call(xAxis.scale(xScale_v3));
    yAxisDraw.transition(transitionDelay).call(yAxis.scale(yScale));
    header.select('tspan').text(`Top 15 ${metric} movies ${metric==='popularity'?'':'in $US'}`);
    bars.selectAll('.bar').data(data,d=>d.title).join(
        enter =>{
            enter.append('rect').attr('class','bar')
                 .attr('x',0).attr('y',d=>yScale(d.title))
                 .attr('height',yScale.bandwidth())
                 .style('fill','lightcyan')
                 .transition(transitionDelay)
                 .delay((d,i)=>i*20)
                 .attr('width',d=>xScale_v3(d[metric]))
                 .style('fill','dodgerblue')
        },
        update => {
                    update.transition(transitionDelay)
                          .delay((d,i)=>i*20)
                          .attr('y',d=>yScale(d.title))
                          .attr('width',d=>xScale_v3(d[metric]))
        },
        exit => {
                    exit.transition().duration(defaultDelay/2)
                        .style('fill-opacity',0)
                        .remove()
        }
    );
    d3.selectAll('.bar')
      .on('mouseover',mouseover)
      .on('mousemove',mousemove)
      .on('mouseout',mouseout);

}
update(barChartData);
//interactive 互動處理
const tip = d3.select('.tooltip');
function mouseover(e){
tip.style('left',e.clientX+'px')
.style('top',e.clientY+'px')
.style('opacity',0.98)
.html("Hello")
}
//interactive 新增監聽
d3.selectAll('.bar').on('mouseover',mouseover);
function mouseover(e){
    //get data
    const thisBarData = d3.select(this).data()[0];
    const bodyData = [
    ['Budget', thisBarData.budget],
    ['Revenue', thisBarData.revenue],
    ['Profit', thisBarData.revenue - thisBarData.budget],
    ['TMDB Popularity', Math.round(thisBarData.popularity)],
    ['IMDB Rating', thisBarData.vote_average],
    ['Genres', thisBarData.genres.join(', ')]
    ];
    tip.style('left',(e.clientX+15)+'px')
    .style('top',e.clientY+'px')
    .style('opacity',0.98);
    tip.select('h3').html(`${thisBarData.title}, ${thisBarData.release_year}`);
    tip.select('h4').html(`${thisBarData.tagline}, ${thisBarData.runtime} min.`);
    d3.select('.tip-body').selectAll('p').data(bodyData)
    .join('p').attr('class', 'tip-info')
    .html(d=>`${d[0]} : ${d[1]}`);
    tip.style('left',(e.clientX+15)+'px')
       .style('top',e.clientY+'px')
       .transition()
       .style('opacity',0.98);

}
    

function mousemove(e){
        tip.style('left',(e.clientX+15)+'px')
           .style('top',e.clientY+'px');
}

function mouseout(e){
    tip.transition()
       .style('opacity',0);
}
d3.selectAll('.bar')
.on('mouseover',mouseover)
.on('mousemove',mousemove)
.on('mouseout',mouseout);
function formatTicks(d){
    return d3.format('.2s')(d)
    .replace('M',' mil').replace('G',' bil').replace('T',' tri')
    }
const bodyData = [
    ['Budget', formatTicks(thisBarData.budget)],
    ['Revenue', formatTicks(thisBarData.revenue)],
    ['Profit', formatTicks(thisBarData.revenue - thisBarData.budget)],
    ['TMDB Popularity', Math.round(thisBarData.popularity)],
    ['IMDB Rating', thisBarData.vote_average],
    ['Genres', thisBarData.genres.join(', ')]
];
}

function ready(movies){
    const movieClean = filterData(movies);
    const revenueData = chooseData("revenue",movieClean);
    setupCanvas(revenueData, movieClean);
}

d3.csv('movies.csv',type).then(
    res => {
        //console.log(res);
        ready(res);
    }
);

function chooseData(metric, movieClean){
    const thisData = movieClean.sort((a,b)=>b[metric]-a[metric]).filter((d,i)=>i<15);
    return thisData;
}