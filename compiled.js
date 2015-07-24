function Fiddle( json){
    json["filters"] = {};
    json["maps"] = {};
    this.data = json;
    this.master = json;
    this.figures = {}
}

Fiddle.prototype.reset = function (){
    this.data = this.master;
}

Fiddle.prototype.setPeriod = function(dimension,period){
	
    var dataset = this.data.dataset;
    for (i = 0; i < dataset.length; i++) {
        var utcSeconds = dataset[i][dimension];
	var time = new Date(0); // The 0 there is the key, which sets the date to the epoch
	time.setUTCSeconds(utcSeconds);
	if(period.toLowerCase() ==="second")
	    dataset[i][dimension] = time.getSeconds();
	else if(period.toLowerCase() ==="minute")
	    dataset[i][dimension] = time.getMinutes();
	else if(period.toLowerCase() ==="hour")
	    dataset[i][dimension] = time.getHours();
	else if(period.toLowerCase() ==="day")
	    dataset[i][dimension] = time.getDay();
	else if(period.toLowerCase() ==="days")
	    dataset[i][dimension] = time.getDate();
	else if(period.toLowerCase() ==="week")
	    dataset[i][dimension] = (time.getDate()/7) +1;
	else if(period.toLowerCase() ==="month")
	    dataset[i][dimension] = time.getMonth();
	else if(period.toLowerCase() ==="year")
	    dataset[i][dimension] = time.getFullYear();
    }


}


Fiddle.prototype.clearFig = function(tag){
    d3.select(tag).html("");
    delete this.figures[tag];
};

Fiddle.prototype.clear = function (){
    this.data = this.master;
    for(tag in this.figures){
	d3.select(tag).html("");
    }
    this.figures = {}
};

Fiddle.prototype.addFilter = function (key,func){
    this.data["filters"][key] = func;
};
Fiddle.prototype.removeFilter = function(key){
    delete this.data["filters"][key];
}
Fiddle.prototype.addMap = function (key, func){
    this.data["maps"][key] = key;
};
Fiddle.prototype.removeMap = function(key){
    delete this.data["maps"][key];
}
Fiddle.prototype.filter = function(){
    var results = [];
    var dataset = this.data.dataset;
    var filters = this.data["filters"];
    for (i = 0; i < dataset.length; i++) {
	var check = true;
	for(j = 0; j< filters.length; j++){ 
		var check = check && filters[j](dataset[i]);
	}
	if(check == true){
	    results.push(dataset[i]);
	}
    }
    this.data.dataset = results;
};
Fiddle.prototype.map = function(ordering){
    var results = [];
    var dataset = this.data.dataset;


    var maps = this.data["maps"];
    var indexes = !ordering ? Array.apply(null, Array(maps.length)).map(function (_, i) {return i;}) : ordering;
    for (i = 0; i < dataset.length; i++) {
	for(j = 0; j< indexes.length; j++){ 
		dataset[i] = maps[indexes[j]](dataset[i]);
	}

    }
    this.data.dataset = dataset;
};

Fiddle.prototype.update = function(tag){
	func = this.figures[tag]
	func();
};
Fiddle.prototype.overview = this.parallel;
Fiddle.prototype.explore = function(dimens,tag, height, width, margin){
    if(dimens.length ===1){
	return this.histogram(dimens[0],tag, height,width,margin);
    }
    else if(dimens.length ===2){
	var x = dimens[0];
	var y = dimens[1];
	
	var x_s = this.data.dimensions[x].space==="continuous" ? 1 : 0;
	var y_s = this.data.dimensions[y].space==="continuous" ? 1 : 0;

	var space = x_s + y_s;
	if(space===0 || space===1)
	    return this.heatmap(x,y,tag,height,width,margin);
	else if(space===2){
	    return this.scatterplot(x,y,tag,height,width,margin);
	}
    }
    else if(dimens.length ===3){
        var x = dimens[0];
	var y = dimens[1];
	var z = dimens[2];
	
	return this.scatterplot3D(x,y,z,tag,height,width,margin);
    }

};Fiddle.prototype.histogram = function(dimension, tag ,height, width, margin) {
    var existing = d3.select(tag);
    existing.selectAll("svg").remove();
    
    margin = margin == null ? {top: 20, right: 20, bottom: 50, left: 40} : margin;

    width = width == null ? 960 : width;
    width = width - margin.left - margin.right;
    height = height == null ? 450 : height;
    height = height - margin.top - margin.bottom;
    
    var svg =  d3.select(tag).append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
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
    .range([height, 0]);

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

	var x = d3.scale.linear()
	.domain([Math.min.apply(Math, values), Math.max.apply(Math, values)])
	.range([0, width]);

	// Generate a histogram using twenty uniformly-spaced bins.
	var data = d3.layout.histogram()
	.bins(x.ticks(20))
	(values);
	console.log(data);

	var y = d3.scale.linear()
	.domain([0, d3.max(data, function(d) { return d.y; })])
	.range([height, 0]);

	var xAxis = d3.svg.axis()
	.scale(x)
	.orient("bottom");

	var yAxis = d3.svg.axis()
	.scale(y)
	.orient("left");

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
    this.figures[tag] = Fiddle.prototype.histogram.bind(this,dimension,tag,height ,width ,margin);
    return svg;
};Fiddle.prototype.scatterplot3D = function(x_dim,y_dim,z_dim, tag, height, width, margin){

    margin = margin == null ? {top: 50, right: 120, bottom: 100, left: 100} : margin;

    width = width == null ? 960 : width;
    width = width - margin.left - margin.right;
    height = height == null ? 450 : height;
    height = height - margin.top - margin.bottom;


    var dataset  = this.data.dataset;
    var x = d3.scale.linear()
    .range([0, width]);

    var y = d3.scale.linear()
    .range([height, 0]);

    var color = d3.scale.category10();

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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    if(this.data.dimensions[z_dim].space ==="continuous"){

        var values = [];
        for (i =0; i < this.data.dataset.length; i++){
            values.push(this.data.dataset[i][z_dim]);
        }
        var max = Math.max.apply(Math, values);
        var min = Math.min.apply(Math, values);
        var step = (max - min) / 10;
        z_map = function(s){
            var mult = Math.round(s/step);
            return parseFloat((mult*step).toPrecision(2));
        };
    }
    else{
        z_map = function(s){return s;};
    }


            x.domain(d3.extent(dataset, function(d) {  return d[x_dim]; })).nice();
	    y.domain(d3.extent(dataset, function(d) {  return d[y_dim]; })).nice();

	    svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text(x_dim);

	    svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text(y_dim)

		svg.selectAll(".dot")
		.data(dataset)
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 3.5)
		.attr("cx", function(d) { return x(d[x_dim]); })
		.attr("cy", function(d) { return y(d[y_dim]); })
                .style("fill", function(d) { return color(z_map(d[z_dim])); });
            var colors = this.data.dimensions[z_dim] === "continuous" ? color.domain().sort(function(a,b) { return a - b;}) :color.domain.sort();
	    var legend = svg.selectAll(".legend")
                .data(colors)
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	    legend.append("rect")
		.attr("x", width)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", color);

	    legend.append("text")
		.attr("x", width + 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "start")
                .html(function(d) { return "&le; " +  d; });



};Fiddle.prototype.heatmap = function(x,y,tag, height, width, margin){
    var existing = d3.select(tag);
    existing.selectAll("svg").remove();

    margin = margin == null ? {top: 50, right: 50, bottom: 100, left: 100} : margin;

    width = width == null ? 960 : width;
    width = width - margin.left - margin.right;
    height = height == null ? 450 : height;
    height = height - margin.top - margin.bottom;


    var unmerged = this.data.dataset;
    var merged = {};
    var dataset = [];
    var hor = [];
    var ver = [];
    var x_map = null;
    var y_map = null;
    
    if(this.data.dimensions[x].space ==="continuous"){

        var values = [];
	for (i =0; i < this.data.dataset.length; i++){
            values.push(this.data.dataset[i][x]);
	}
	var max = Math.max.apply(Math, values);
	var min = Math.min.apply(Math, values);
	var step = (max - min) / 10;
	x_map = function(s){
	    var mult = Math.round(s/step);
	    return parseFloat((mult*step).toPrecision(2));
	};
    }
    else{
	x_map = function(s){return s;};
    }
    if(this.data.dimensions[y].space ==="continuous"){

        var values = [];
	for (i =0; i < this.data.dataset.length; i++){
            values.push(this.data.dataset[i][y]);
	}
	var max = Math.max.apply(Math, values);
	var min = Math.min.apply(Math, values);
	var step = (max - min) / 10;
	y_map = function(s){
	    var mult = Math.round(s/step);
	    return parseFloat((mult*step).toPrecision(2));
	};
    }
    else{
	y_map = function(s){return s;};
    }

    for( i = 0; i< unmerged.length; i++){
	hor.push(x_map(unmerged[i][x]));
	ver.push(y_map(unmerged[i][y]));
	var key = String(x_map(unmerged[i][x])) + String(y_map(unmerged[i][y]));
       	if(key in merged){
	    merged[key]["magnitude"]+=1;
	}
	else{         
	    var temp = unmerged[i];
	    temp[x] = x_map(temp[x]);
	    temp[y] = y_map(temp[y]);
	    temp["magnitude"] = 1;
	    merged[key] = temp;
       }

    }
    for (key in merged) {
    dataset.push(merged[key]);
    }
    console.log(dataset);
    var horizontal = hor.unique();
    var vertical = ver.unique();
    
    horizontal = this.data.dimensions[x].space === "continuous" || this.data.dimensions[x].type=="time" ? horizontal.sort(function(a,b) { return a - b;}): horizontal.sort();   
    vertical = this.data.dimensions[y].space === "continuous" || this.data.dimensions[y].type=="time" ? vertical.sort(function(a,b) { return a - b;}): vertical.sort();   
    var gridSize = 76;//Math.floor(width / horizontal.length);
    var buckets = 9; //denotes heat scale
    var legendElementWidth = width / buckets ;


    height = gridSize*(vertical.length + 1) - margin.top - margin.bottom;
    width = gridSize*(horizontal.length + 1);
    var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]; // alternatively colorbrewer.YlGnBu[9]
    var label = function(val, dim){
	if(this.data.dimensions[dim].type==="number"){
	    if(this.data.dimensions[dim].space ==="discrete"){
		return Math.round(100*val)/100;
	    }
	    else if(this.data.dimensions[dim].space ==="continuous"){
		return "&le; " + Math.round(100*val)/100;
	    }
	}
	return val;
    };

	       var colorScale = d3.scale.quantile()
		   .domain([0, buckets - 1, d3.max(dataset, function (d) { return d.magnitude; })])
		   .range(colors);

	       var svg = d3.select(tag).append("svg")
		   .attr("width", width + margin.left + margin.right)
		   .attr("height", height + margin.top + margin.bottom)
		   .append("g")
		   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	       var vert_axis = svg.selectAll(".vertical")
		   .data(vertical)
		   .enter().append("text")
                   .html(function(d) { return label(d,y); })
		   .attr("x", 0)
		   .attr("y", function (d, i) { return i * gridSize; })
		   .style("text-anchor", "end")
		   .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
		   .attr("class", function (d, i) { return "vertical mono axis"; });

	       var hor_axis = svg.selectAll(".horizontal")
		   .data(horizontal)
		   .enter().append("text")
                   .html(function(d) { return label(d,x); })
		   .attr("x", function(d, i) { return i * gridSize; })
		   .attr("y", 0)
		   .style("text-anchor", "middle")
		   .attr("transform", "translate(" + gridSize / 2 + ", -6)")
		   .attr("class", function(d, i) { return  "horizontal mono axis"; });

               /* Add label to horizontal axis */
               svg.append("text")
              .attr("dy", ".71em")
              .attr("font-size", "20px")
              .attr("x", 0)
              .attr("y", -45)
              .style("text-anchor", "start")
              .text(x);

              /* Add label to vertical axis */
               svg.append("text")
              .attr("dy", ".71em")
              .attr("font-size", "20px")
              .attr("x", 20)
              .attr("y", -100)
              .attr("transform", "rotate(-90)")
              .style("text-anchor", "end")
              .text(y);

               
	       var heatMap = svg.selectAll(".hour")
		   .data(dataset)
		   .enter().append("rect")
    .attr("x", function(d) { return horizontal.indexOf(d[x]) * gridSize; })
    .attr("y", function(d) { return vertical.indexOf(d[y]) * gridSize; })
		   .attr("rx", 4)
		   .attr("ry", 4)
		   .attr("class", "hour bordered")
		   .attr("width", gridSize)
		   .attr("height", gridSize)
		   .style("fill", colors[0])
                   .on("mouseover", function(){ ;
				 d3.select(this).transition().duration(100)
				 .style({'stroke' : '#000'});
						this.parentNode.appendChild(this);}
                    )
                   .on("mouseout", function(d){
			   d3.select(this).transition().duration(100)
			   .style({'stroke' : '#E6E6E6'});});
    
	       heatMap.transition().duration(1000)
    .style("fill", function(d) { return colorScale(d.magnitude); });

	       heatMap.append("title").text(function(d) { return d.magnitude; });
              
	       var legend = svg.selectAll(".legend")
		   .data([0].concat(colorScale.quantiles()), function(d) { return d; })
		   .enter().append("g")
		   .attr("class", "legend");

	       legend.append("rect")
		   .attr("x", function(d, i) { return legendElementWidth * i; })
		   .attr("y", height + gridSize)
		   .attr("width", legendElementWidth)
		   .attr("height", gridSize / 2)
                   .style("fill", function(d, i) { return colors[i]; });

	       legend.append("text")
		   .attr("class", "mono")
                   .html(function(d) { return "&ge; " + Math.round(d); })
		   .attr("x", function(d, i) { return legendElementWidth * i; })
		   .attr("y", height + gridSize*1.25)
                   .style({"fill":"#aaa"});

    this.figures[tag] = Fiddle.prototype.heatmap.bind(this,x,y,tag,height ,width ,margin);
    return svg;
};

Fiddle.prototype.scatterplot = function(x_dim,y_dim, tag, height, width, margin){

    margin = margin == null ? {top: 50, right: 50, bottom: 100, left: 100} : margin;

    width = width == null ? 960 : width;
    width = width - margin.left - margin.right;
    height = height == null ? 450 : height;
    height = height - margin.top - margin.bottom;


    var dataset  = this.data.dataset;
    var x = d3.scale.linear()
    .range([0, width]);

    var y = d3.scale.linear()
    .range([height, 0]);

    var color = d3.scale.category10();

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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



            x.domain(d3.extent(dataset, function(d) {  return d[x_dim]; })).nice();
	    y.domain(d3.extent(dataset, function(d) {  return d[y_dim]; })).nice();

	    svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text(x_dim);

	    svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text(y_dim)

		svg.selectAll(".dot")
		.data(dataset)
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 4.5)
		.attr("cx", function(d) { return x(d[x_dim]); })
		.attr("cy", function(d) { return y(d[y_dim]); })
    .style("fill", function(d) { return color(1); });

    this.figures[tag] = Fiddle.prototype.scatterplot.bind(this,x,y,tag,height ,width ,margin);
    return svg;
};Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
};Fiddle.prototype.parallel = function (tag, h, w, m){
    var unmerged = this.data.dataset;
    var merged = {};
    var dataset = [];
    for (i = 0; i < unmerged.length; i++) {
	var key = "";
	for(k in unmerged[i]){
	    key = key + String(k) + String(unmerged[i][k]);
	}
	if(key in merged){
	    merged[key].magnitude+=1;
	}
	else{
	    var temp = unmerged[i];
	    temp["magnitude"] = 1;
	    merged[key] = temp;
	}

    }
    for (key in merged) {
	dataset.push(merged[key]);
    }
    var m = [30, 10, 10, 10],
    w = 960 - m[1] - m[3],
    h = 300 - m[0] - m[2];

var dimens = this.data.dimensions;
    for (i in dimens) { 
	if(dimens[i].type ==="string"){
	    dimens[i]["scale"] = d3.scale.ordinal().rangePoints([0, h]);
	}
	else{
	    dimens[i]["scale"] = d3.scale.linear().range([h, 0]);
	}

    }
var x = d3.scale.ordinal().rangePoints([0, w], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;
    tag = tag===null ? "body" : tag;

    // clear out existing svg for this figure
    var existing = d3.select(tag);
    existing.selectAll("svg").remove();

    var svg = d3.select(tag).append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

var cat_scale = null;
// Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = d3.keys(dataset[0]).filter(function(d) {
	    
		if(d ==="magnitude"){
		    return false;
		}
	    if(dimens[d].type === "string") {
		y[d] = dimens[d].scale.domain(dataset.map( function(p) { return p[d]; }))
		dimens[d]["func"] = y[d];
	    }
	    else {
		
		y[d] = dimens[d].scale.domain(d3.extent(dataset, function(p) { return +p[d]; }))
		dimens[d]["func"] = y[d];
	    }

	    return true;
	}));

// Add grey background lines for context.
background = svg.append("svg:g")
    .attr("class", "background")
    .selectAll("path")
    .data(dataset)
    .enter().append("svg:path")
    .attr("d", path);

// Add blue foreground lines for focus.

foreground = svg.append("svg:g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(dataset)
    .enter().append("svg:path")
    .attr("d", path)
    .attr("title", function(d){ return d.magnitude})
    .on("mouseover", function(d){
            d3.select(this).transition().duration(100)
            .style({'stroke' : '#F00'});
            return true;
        })
    .on("mouseout", function(d){
            d3.select(this).transition().duration(100)
            .style({'stroke': 'steelblue' })
            .style({'stroke-width' : '3'});
            return true;
        });
// Add a group element for each dimension.
var g = svg.selectAll(".dimension")
    .data(dimensions).enter().append("svg:g")
    .attr("class", "dimension")
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    .call(d3.behavior.drag()
	  .on("dragstart", function(d) {
		  dragging[d] = this.__origin__ = x(d);
		  background.attr("visibility", "hidden");
	      })
	  .on("drag", function(d) {
		  dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
		  foreground.attr("d", path);
		  dimensions.sort(function(a, b) { return position(a) - position(b); });
		  x.domain(dimensions);
		  g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
	      })
	  .on("dragend", function(d) {
		  delete this.__origin__;
		  delete dragging[d];
		  transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
		  transition(foreground)
		  .attr("d", path);
          background
		  .attr("d", path)
		  .transition()
		  .delay(500)
		  .duration(0)
	      .attr("visibility", null)
	  }));
	
// Add an axis and title.
g.append("svg:g")
    .attr("class", "axis")
    .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("svg:text")
    .attr("text-anchor", "middle")
    .attr("y", -9)
    .text(String);

// Add and store a brush for each axis.
g.append("svg:g")
    .attr("class", "brush")
    .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
    .selectAll("rect")
    .attr("x", -8)
    .attr("width", 16);
    this.figures[tag] = Fiddle.prototype.parallel.bind(this,tag,h,w,m);

    return svg;

function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
}

function transition(g) {
    return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
    var t = dimensions.map(function(p) {
	    return [position(p), y[p](d[p]) ] });
    return line(t);
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
    var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
	extents = actives.map(function(p) { return y[p].brush.extent(); });

    foreground.style("display", function(d) {

	    return actives.every(function(p, i) {

		    if(dimens[p].type ==="string" ){
			return extents[i][0] <= dimens[p].func(d[p]) && dimens[p].func(d[p]) <= extents[i][1];
		    }
		    return extents[i][0] <= d[p] && d[p] <= extents[i][1];
		}) ? null : "none";
	});
}
}
