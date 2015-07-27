Fiddle.prototype.trend = function (x_dim, trends ,tag, height, width, margin){
    

    margin = {top: 20, right: 80, bottom: 30, left: 50};
    width = 960 - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;
    
    var dataset = this.data.dataset;

    var x = d3.time.scale()
    .range([0, width]);

    var y = d3.scale.linear()
    .range([height, 0]);

    var color = d3.scale.category20b();
    var parseDate = d3.time.format("%Y%m%d").parse;
    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

    var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { console.log(d.date); return x(d.date); })
    .y(function(d) { return y(d.value); });

    var svg = d3.select(tag).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	    color.domain(d3.keys(dataset[0]).filter(function(key) { return key !== x_dim; }));

	    dataset.forEach(function(d) {
		    var date = new Date(0); // The 0 there is the key, which sets the date to the epoch
		    date.setUTCSeconds(d[x_dim]);
		    d.date = date;
		});

    var dimens = color.domain().map(function(name) {
		    if(trends.indexOf(name) > -1){
		    return {
			name: name,
			values: dataset.map(function(d) {
				return {date: d.date, value: +d[name]};
			    })
		    };}
		});
    dimens  = dimens.filter(function(n){ return n != undefined }); 
	    x.domain(d3.extent(dataset, function(d) { return d.date; }));
	    y.domain([
		      d3.min(dimens, function(c) { return d3.min(c.values, function(v) { return v.value; }); }),
		      d3.max(dimens, function(c) { return d3.max(c.values, function(v) { return v.value; }); })
		      ]);

	    svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	    svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)


	    var dimen = svg.selectAll(".dimension")
		.data(dimens)
		.enter().append("g")
		.attr("class", "dimension");

	    dimen.append("path")
		.attr("class", "trend_line")
    .attr("d", function(d) { console.log(d); console.log(line(d.values));  return line(d.values); })
		.style("stroke", function(d) { return color(d.name); });

	    dimen.append("text")
		.datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
                .attr("transform", function(d) { console.log(d); return "translate(" + x(d.value.date) + "," + y(d.value.value) + ")"; })
                .attr("class","trend_text")
                .attr("x", 3)
		.attr("dy", ".35em")
		.text(function(d) { return d.name; });

    this.figures[tag] = Fiddle.prototype.trend.bind(this,x_dim, trends,tag,height ,width ,margin);
    return svg;
};

