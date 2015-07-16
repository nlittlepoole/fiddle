function Fiddle( json){
    this.data = json;
    this.master = json;
    this.figures = {}
}

Fiddle.prototype.reset = function (){
    this.data = this.master;
}


Fiddle.prototype.clearFig = function(tag){
    d3.select(tag).html("");
    delete this.figures[tag];
    }

Fiddle.prototype.clear = function (){
    this.data = this.master;
    for(tag in this.figures){
	d3.select(tag).html("");
    }
    this.figures = {}
}

Fiddle.prototype.addFilter = function (func){
    this.data["filters"] = "filters" in this.data && this.data["filters"].length > 0 ?  this.data["filters"].push(func)  : [func];
}
Fiddle.prototype.addMap = function ( func){
    this.data["maps"] = "maps" in this.data && this.data["maps"].length > 0 ?  this.data["maps"].push(func)  : [func];
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
}
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
}

    Fiddle.prototype.update = function(tag){
	func = this.figures[tag]
	func();
    }

Fiddle.prototype.parallel = function (tag, h, w, m){
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
    existing.selectAll("svg").remove()

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
		dimens["d"]["func"] = y[d];
	    }
	    else {
		
		y[d] = dimens[d].scale.domain(d3.extent(dataset, function(p) { return +p[d]; }))
		dimens["d"]["func"] = y[d];
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
    .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    .on("mouseout", function(d){
            d3.select(this).transition().duration(100)
            .style({'stroke': 'steelblue' })
            .style({'stroke-width' : '2'});
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
	    return [position(p), y[p](d[p]) + 10*Math.random()]; });
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
Fiddle.prototype.bar = function() {
    dataset = this.data.dataset;
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
    .range([height, 0]);

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10, "%");

    
    var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


	x.domain(dataset.map(function(d) { return d.letter; }));
	y.domain([0, d3.max(dataset, function(d) { return d.frequency; })]);

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
	    .text("Frequency");

	svg.selectAll(".bar")
	    .data(dataset)
	    .enter().append("rect")
	    .attr("class", "bar")
	    .attr("x", function(d) { return x(d.letter); })
	    .attr("width", x.rangeBand())
	    .attr("y", function(d) { return y(d.frequency); })
	    .attr("height", function(d) { return height - y(d.frequency); });
    

};