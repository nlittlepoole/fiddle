Fiddle.prototype.histogram = function(dimension, tag ,height, width, margin) {
    var existing = d3.select(tag);
    existing.selectAll("svg").remove();
    
    margin = margin == null ? {top: 20, right: 20, bottom: 50, left: 40} : margin;

    width = width == null ? 960 : width;
    width = width - margin.left - margin.right;
    height = height == null ? 550 : height;
    height = height - margin.top - margin.bottom;

    var color = d3.scale.category20b();
    for( i=0; i < 10;i++){
	color(i);
    }
    var col = dimension.length % 20;
    var svg =  d3.select(tag).append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
        .attr("id",tag.replace(".",""))
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

    var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
    .range([height, 25]);

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");


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


	var bar = svg.selectAll(".bar")
    .data(dataset).enter().append("g").attr("class", "bar");
    
       bar.append("rect")
	   .style("fill", color(col))
	    .attr("x", function(d) { return x(d.name); })
	    .attr("width", x.rangeBand())
	    .attr("y", function(d) { return y(d.frequency); })
            .attr("height", function(d) { return height - y(d.frequency); });
      

       bar.append("text")
	    .attr("dy", ".75em")
	    .style("font-size", 20)
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

	var color = d3.scale.category20b();
	for( i=0; i < 10;i++){
	    color(i);
	}
	var col = dimension.length % 20;

	var x = d3.scale.linear()
	.domain(d3.extent(values) /* [Math.min.apply(Math, values), Math.max.apply(Math, values) ]*/)
	.range([0, width]);

	// Generate a histogram using twenty uniformly-spaced bins.
	var data = d3.layout.histogram()
	.bins(x.ticks(20))
	(values);

	var y = d3.scale.linear()
	.domain([0, d3.max(data, function(d) { return d.y; })])
	.range([height, 25]);

	var xAxis = d3.svg.axis()
	.scale(x).ticks(20)
	.orient("bottom");

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

	var bar = svg.selectAll(".bar")
	.data(data)
	.enter().append("g")
	.style("fill",color(col))
	.attr("class", "bar")
	.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
       
	bar.append("rect")
	.attr("x", 1)
	.attr("width", x(data[0].x -1 ) > 44 ? x(data[0].x -1 ) : 44)
	.attr("height", function(d) { return height - y(d.y); });

	bar.append("text")
	.style("font-size" , 20)
	.attr("dy", ".75em")
	.attr("y", 6)
	.attr("x", x(data[0].dx -1) / 2 > 22 ? x(data[0].x -1 )/2 : 22)
	.attr("text-anchor", "middle")
	.text(function(d) { return formatCount(d.y); });


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

    }
    this.figures[tag] = Fiddle.prototype.histogram.bind(this,dimension,tag,height ,width ,margin);
    return svg;
};