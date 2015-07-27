Fiddle.prototype.heatmap = function(x,y,tag, height, width, margin){
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
	var x_step = (max - min) / 10;
	x_map = function(s){
	    var mult = Math.round(s/x_step);
	    return parseFloat((mult*x_step).toPrecision(2));
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
	var y_step = (max - min) / 10;
	y_map = function(s){
	    var mult = Math.round(s/y_step);
	    return parseFloat((mult*y_step).toPrecision(2));
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
    width = horizontal.length > 10 ? gridSize*(horizontal.length + 1) : gridSize * 10;
    var colors = ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]; // alternatively colorbrewer.YlGnBu[9]


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
                   .attr("id",tag.replace(".",""))
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

    var color = d3.scale.category20b();

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

    var svg = d3.select(tag).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id",tag.replace(".",""))
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
		.attr("r", 6.5)
		.attr("cx", function(d) { return x(d[x_dim]); })
		.attr("cy", function(d) { return y(d[y_dim]); })
    .style("fill", function(d) { return color(1); });

    this.figures[tag] = Fiddle.prototype.scatterplot.bind(this,x,y,tag,height ,width ,margin);
    return svg;
};