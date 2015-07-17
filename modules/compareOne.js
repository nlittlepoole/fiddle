Fiddle.prototype.histogram = function(dimension, tag) {

    if (this.data.dimensions[dimension].space==="discrete"){
    var dataset = [];
    var raw = {};
    for (i =0; i < this.data.dataset.length; i++){
	var temp = this.data.dataset[i];
	var val = temp[dimension];
	raw[val] = val in raw ? raw[val]  : {"name": val, "frequency":0  }  ;
	raw[val].frequency+=1;
    }
    for(v in raw){
	dataset.push(raw[v]);
    }
    var margin = {top: 20, right: 20, bottom: 50, left: 40},

    width = 960 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
    .range([height, 0]);

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

    
    var svg = d3.select(tag).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


	x.domain(dataset.map(function(d) { return d.name; }));
	y.domain([0, d3.max(dataset, function(d) { return d.frequency; })]);

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis)
	    .append("text")
	    .attr("dy", ".71em")
            .attr("font-size", "20px")
            .attr("x", width/2)
    .attr("y", 25) 
	    .style("text-anchor", "middle")
	    .text(dimension);

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Count");

	var bar = svg.selectAll(".bar")
    .data(dataset).enter().append("g").attr("class", "bar");
    
       bar.append("rect")
	    .attr("x", function(d) { return x(d.name); })
	    .attr("width", x.rangeBand())
	    .attr("y", function(d) { return y(d.frequency); })
            .attr("height", function(d) { return height - y(d.frequency); });
      bar.append("text")
	    .attr("dy", ".75em")
    .attr("y",  function(d) { return y(d.frequency) ; })
            .attr("x", function(d){return x(d.name) + x.rangeBand()/2;})
	    .attr("text-anchor", "middle")
	    .text(function(d) { return d.frequency; });
    }
    else if(this.data.dimensions[dimension].space==="continuous"){

	var values = [];
	for (i =0; i < this.data.dataset.length; i++){
	    values.push(this.data.dataset[i][dimension]);
        }

	// A formatter for counts.
	var formatCount = d3.format(",.0f");

	var margin = {top: 10, right: 30, bottom: 30, left: 30},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	var x = d3.scale.linear()
	.domain([Math.min.apply(Math, values), Math.max.apply(Math, values)])
	.range([0, width]);

	// Generate a histogram using twenty uniformly-spaced bins.
	var data = d3.layout.histogram()
	.bins(x.ticks(20))
	(values);

	var y = d3.scale.linear()
	.domain([0, d3.max(data, function(d) { return d.y; })])
	.range([height, 0]);

	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

	var svg = d3.select("body").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var bar = svg.selectAll(".bar")
	.data(data)
	.enter().append("g")
	.attr("class", "bar")
	.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

	bar.append("rect")
	.attr("x", 1)
	.attr("width", x(data[0].dx) - 1)
	.attr("height", function(d) { return height - y(d.y); });

	bar.append("text")
	.attr("dy", ".75em")
	.attr("y", 6)
	.attr("x", x(data[0].dx) / 2)
	.attr("text-anchor", "middle")
	.text(function(d) { return formatCount(d.y); });

	svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	    .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", ".71em")
	    .style("text-anchor", "end")
	    .text("Count");

    }
};