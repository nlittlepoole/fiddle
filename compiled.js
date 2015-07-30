function Fiddle( json){
    this.data = json;
    this.master = json;
    this.figures = {}
}

Fiddle.prototype.reset = function (){
    this.data = this.master;
}

Fiddle.prototype.setPeriodContinuous = function(dimension,period){
    var dataset = this.data.dataset;
    this.data.dimensions[dimension].space = "continuous";
    this.data.dimensions[dimension].type = "number";
    for (i = 0; i < dataset.length; i++) {
        var utcSeconds = dataset[i][dimension];
	var time = new Date(0); // The 0 there is the key, which sets the date to the epoch
	time.setUTCSeconds(utcSeconds);
	if(period.toLowerCase() ==="second")
	    dataset[i][dimension] = time.getSeconds();
	else if(period.toLowerCase() ==="minute")
	    dataset[i][dimension] = time.getMinutes() + time.getSeconds()/60.0;
	else if(period.toLowerCase() ==="hour")
	    dataset[i][dimension] = time.getHours() + time.getMinutes()/60.0 + time.getSeconds()/60.0/10.0;
	else if(period.toLowerCase() ==="day")
	    dataset[i][dimension] = time.getDay() +  time.getHours()/24.0 + time.getMinutes()/60.0/10.0 + time.getSeconds()/60.0/100.0;
	else if(period.toLowerCase() ==="days")
	    dataset[i][dimension] = time.getDate() + time.getHours()/24.0 + time.getMinutes()/60.0/10.0 + time.getSeconds()/60.0/100.0;
	else if(period.toLowerCase() ==="week")
	    dataset[i][dimension] = ((time.getDate()/7) + 1) + time.getDay()/7.0 +  time.getHours()/24.0/10.0 + time.getMinutes()/60.0/100.0;
	else if(period.toLowerCase() ==="month")
	    dataset[i][dimension] = time.getMonth() + ((time.getDate()/7) + 1)/4.0 + time.getDay()/7.0/10.0 +  time.getHours()/24.0/100.0;
	else if(period.toLowerCase() ==="year")
	    dataset[i][dimension] = time.getFullYear() + time.getMonth()/12.0 + ((time.getDate()/7) + 1)/4.0/10.0 + time.getDay()/7.0/100.0;
    }
}
Fiddle.prototype.setPeriodDiscrete = function(dimension,period){
    var dataset = this.data.dataset;
    this.data.dimensions[dimension].space = "discrete";
    this.data.dimensions[dimension].type = "number";
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
Fiddle.prototype.filter = function(filt){
    var results = [];
    var dataset = this.data.dataset;
    for (i = 0; i < dataset.length; i++) {
	var check = filt(dataset[i]);
	if(check == true){
	    results.push(dataset[i]);
	}
    }
    this.data.dataset = results;
};
Fiddle.prototype.map = function(mapper){
    var dataset = this.data.dataset;
    for (i = 0; i < dataset.length; i++) {
	  dataset[i] = mapper(dataset[i]);
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
	
	if(this.data.dimensions[x].type==="time" && space===2){
	    return this.trend(x,[y],tag, height, width, margin);
	}
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
	
	var x_s = this.data.dimensions[x].space==="continuous" ? 1 : 0;
        var y_s = this.data.dimensions[y].space==="continuous" ? 1 : 0;
	var z_s = this.data.dimensions[z].space==="continuous" ? 1 : 0;

	if(this.data.dimensions[x].type==="time" && x_s+y_s+z_s===3){
            return this.trend(x,[y,z],tag, height, width,margin);
        }

	if((x_s===1 && y_s===1) || z_s ===0 ){
	    return this.scatterplot3D(x,y,z,tag,height,width,margin);
	}
	else {
	    return this.heatmap3D(x,y,z,tag,height,width,margin);
	}
    }
    else if(dimens.length > 3){
	var space = 0;
	for(i = 0; i < dimens.length; i++){
	    space += this.data.dimensions[dimens[i]].space==="continuous" ? 1 : 0;
	}
	if(this.data.dimensions[x].type==="time" && space===dimens.length){
	    dimens.splice(0, 1); 
            return this.trend(x,dimens,tag, height, width,margin);
        }
    }

};Fiddle.prototype.histogram = function(dimension, tag ,height, width, margin) {
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

    var color = d3.scale.category20();

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


    if(this.data.dimensions[z_dim].space ==="continuous"){

        var values = [];
        for (i =0; i < this.data.dataset.length; i++){
            values.push(this.data.dataset[i][z_dim]);
        }
        var max = Math.max.apply(Math, values);
        var min = Math.min.apply(Math, values);
        var z_step = (max - min) / 10;
        z_map = function(s){
            var mult = Math.round(s/z_step);
            return parseFloat((mult*z_step).toPrecision(2));
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

            /* Add label to legend */
            svg.append("text")
               .attr("dy", ".71em")
               .attr("font-size", "20px")
               .attr("x", width - 25)
               .attr("y", -25)
               .style("text-anchor", "start")
    .style("text-decoration", "underline")
               .text(z_dim);

		svg.selectAll(".dot")
		.data(dataset)
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 6)
		.attr("cx", function(d) { return x(d[x_dim]); })
		.attr("cy", function(d) { return y(d[y_dim]); })
                .style("fill", function(d) { return color(z_map(d[z_dim])); });
    var colors = this.data.dimensions[z_dim] === "continuous" ? color.domain().sort(function(a,b) { return a - b;}) :color.domain().sort();
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



};
Fiddle.prototype.heatmap3D = function(x,y, z,tag, height, width, margin){
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
    var z_map = null;

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
    if(this.data.dimensions[z].space ==="continuous"){

        var values = [];
        for (i =0; i < this.data.dataset.length; i++){
            values.push(this.data.dataset[i][z]);
        }
        var max = Math.max.apply(Math, values);
        var min = Math.min.apply(Math, values);
        var z_step = (max - min) / 10;
        z_map = function(s){
            var mult = Math.round(s/z_step);
            return parseFloat((mult*z_step).toPrecision(2));
        };
    }
    else{
        return null;
    }

    for( i = 0; i< unmerged.length; i++){
        hor.push(x_map(unmerged[i][x]));
        ver.push(y_map(unmerged[i][y]));
        var key = String(x_map(unmerged[i][x])) + String(y_map(unmerged[i][y]));
        if(key in merged){
	    merged[key]["avg"] = (merged[key]["avg"] * merged[key]["magnitude"] + unmerged[i][z]) / (merged[key]["magnitude"] + 1)
            merged[key]["magnitude"]+=1;
        }
        else{
            var temp = unmerged[i];
            temp[x] = x_map(temp[x]);
            temp[y] = y_map(temp[y]);
	    temp["avg"] = temp[z] + 0.0;
            temp["magnitude"] = 1.0;
            merged[key] = temp;
	}

    }
    for (key in merged) {
	dataset.push(merged[key]);
    }
    console.log(dataset);
    var horizontal = hor.unique();
    var vertical = ver.unique();
    console.log(horizontal);


    horizontal = this.data.dimensions[x].space === "continuous" || this.data.dimensions[x].type=="time" ? horizontal.sort(function(a,b) { return a - b;}): horizontal.sort();
    vertical = this.data.dimensions[y].space === "continuous" || this.data.dimensions[y].type=="time" ? vertical.sort(function(a,b) { return a - b;}): vertical.sort();
    var gridSize = 76;//Math.floor(width / horizontal.length);
    var buckets = 9; //denotes heat scale
    var legendElementWidth = width / buckets ;


    height = gridSize*(vertical.length + 1) - margin.top - margin.bottom;
    width = horizontal.length>9 ? gridSize*(horizontal.length + 1) : gridSize*10;
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
    .domain([0, buckets - 1, d3.max(dataset, function (d) { console.log(z_map(d.avg)); return z_map(d.avg); }) ])
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
    .style("fill", function(d) { return colorScale(d.avg); });

    heatMap.append("title").text(function(d) { return z_map(d.avg); });

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
    .html(function(d) { return "&le;" + parseFloat((d).toPrecision(2)); })
    .attr("x", function(d, i) { return legendElementWidth * i; })
    .attr("y", height + gridSize*1.25)
    .style({"fill":"#aaa"});

    this.figures[tag] = Fiddle.prototype.heatmap.bind(this,x,y,tag,height ,width ,margin);
    return svg;
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
};Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

Array.prototype.contains = function(v) {
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
};

	var out$ = typeof exports != 'undefined' && exports || this;

	var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

	function isExternal(url) {
	    return url && url.lastIndexOf('http',0) == 0 && url.lastIndexOf(window.location.host) == -1;
	}

	function inlineImages(el, callback) {
	    var images = el.querySelectorAll('image');
	    var left = images.length;
	    if (left == 0) {
		callback();
	    }
	    for (var i = 0; i < images.length; i++) {
		(function(image) {
		    var href = image.getAttributeNS("http://www.w3.org/1999/xlink", "href");
		    if (href) {
			if (isExternal(href.value)) {
			    console.warn("Cannot render embedded images linking to external hosts: "+href.value);
			    return;
			}
		    }
		    var canvas = document.createElement('canvas');
		    var ctx = canvas.getContext('2d');
		    var img = new Image();
		    href = href || image.getAttribute('href');
		    img.src = href;
		    img.onload = function() {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			image.setAttributeNS("http://www.w3.org/1999/xlink", "href", canvas.toDataURL('image/png'));
			left--;
			if (left == 0) {
			    callback();
			}
		    }
		    img.onerror = function() {
			console.log("Could not load "+href);
			left--;
			if (left == 0) {
			    callback();
			}
		    }
		})(images[i]);
	    }
	}

	function styles(el, selectorRemap) {
	    var css = "";
	    var sheets = document.styleSheets;
	    for (var i = 0; i < sheets.length; i++) {
		if (isExternal(sheets[i].href)) {
		    console.warn("Cannot include styles from other hosts: "+sheets[i].href);
		    continue;
		}
		var rules = sheets[i].cssRules;
		if (rules != null) {
		    for (var j = 0; j < rules.length; j++) {
			var rule = rules[j];
			if (typeof(rule.style) != "undefined") {
			    var match = null;
			    try {
				match = el.querySelector(rule.selectorText);
			    } catch(err) {
				console.warn('Invalid CSS selector "' + rule.selectorText + '"', err);
			    }
			    if (match) {
				var selector = selectorRemap ? selectorRemap(rule.selectorText) : rule.selectorText;
				css += selector + " { " + rule.style.cssText + " }\n";
			    } else if(rule.cssText.match(/^@font-face/)) {
				css += rule.cssText + '\n';
			    }
			}
		    }
		}
	    }
	    return css;
	}

	out$.svgAsDataUri = function(el, options, cb) {
	    options = options || {};
	    options.scale = options.scale || 1;
	    var xmlns = "http://www.w3.org/2000/xmlns/";

	    inlineImages(el, function() {
		    var outer = document.createElement("div");
		    var clone = el.cloneNode(true);
		    var width, height;
		    if(el.tagName == 'svg') {
			var box = el.getBoundingClientRect();
			width = parseInt(clone.getAttribute('width') ||
          box.width ||
          clone.style.width ||
					 out$.getComputedStyle(el).getPropertyValue('width'));
			height = parseInt(clone.getAttribute('height') ||
          box.height ||
          clone.style.height ||
					  out$.getComputedStyle(el).getPropertyValue('height'));
			if (width === undefined || 
            width === null || 
			    isNaN(parseFloat(width))) {
			    width = 0;
			}
			if (height === undefined || 
            height === null || 
			    isNaN(parseFloat(height))) {
			    height = 0;
			}
		    } else {
			var box = el.getBBox();
			width = box.x + box.width;
			height = box.y + box.height;
			clone.setAttribute('transform', clone.getAttribute('transform').replace(/translate\(.*?\)/, ''));

			var svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
			    svg.appendChild(clone)
			    clone = svg;
		    }

		    clone.setAttribute("version", "1.1");
		    clone.setAttributeNS(xmlns, "xmlns", "http://www.w3.org/2000/svg");
		    clone.setAttributeNS(xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
		    clone.setAttribute("width", width * options.scale);
		    clone.setAttribute("height", height * options.scale);
		    clone.setAttribute("viewBox", "0 0 " + width + " " + height);
		    outer.appendChild(clone);
		    var css = styles(el, options.selectorRemap);
		    var s = document.createElement('style');
		    s.setAttribute('type', 'text/css');
		    s.innerHTML = "<![CDATA[\n" + css + "\n]]>";
		    var defs = document.createElement('defs');
		    defs.appendChild(s);
		    clone.insertBefore(defs, clone.firstChild);

		    
		    var svg = doctype + outer.innerHTML;
		    console.log(svg);
		    var uri = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svg)));
		    if (cb) {
			cb(uri);
		    }
		});
	}

	out$.saveSvgAsPng = function(el, name, options) {
	    options = options || {};
	    out$.svgAsDataUri(el, options, function(uri) {
		    var image = new Image();
		    image.src = uri;
		    image.onload = function() {
			var canvas = document.createElement('canvas');
			canvas.width = image.width;
			canvas.height = image.height;
			var context = canvas.getContext('2d');
			context.drawImage(image, 0, 0);

			var a = document.createElement('a');
			a.download = name;
			a.href = canvas.toDataURL('image/png');
			document.body.appendChild(a);
			a.addEventListener("click", function(e) {
				a.parentNode.removeChild(a);
			    });
			a.click();
		    }
		});
	};
Fiddle.prototype.save = function(tag){
    var svg = d3.select(tag).selectAll("svg").style("background-color", "#fff");  
    tag = tag.replace(".","");
    console.log(tag);
    saveSvgAsPng(document.getElementById(tag), tag + ".png");
    svg.style("background-color", "");
};Fiddle.prototype.naiveBayes = function(dimens, criteria, alpha, beta){
    var dataset = this.data.dataset;

    var maps = {};
    var probs = {};
    var counts = {};
    counts["total"] = 0;
    probs["total"] = {};
    var alpha = .05;
    var beta = .1;
    for (i =0; i < this.data.dataset.length; i++){
	  for(j=0; j< dimens.length; j++){
	      if(dimens[j] in maps){
		  maps[dimens[j]]["values"].push(dataset[i][dimens[j]]);
	      }
	      else{
		  maps[dimens[j]] = {};
		  maps[dimens[j]]["values"] = [dataset[i][dimens[j] ]];
	      }
	  }
    }

    for(i=0; i< dimens.length; i++){

	var values = maps[dimens[i]]["values"];
	if(this.data.dimensions[dimens[i]].space ==="continuous"){
	    maps[dimens[i]]["map"] = generateMap(values);
	}
	else{
	    maps[dimens[i]]["map"] = function(s){return s;};
	}

    }

    var isFunction = function(functionToCheck) {
	var getType = {};
	return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    if(isFunction(criteria) === true){
	    probs["true"] = {};
	    probs["false"] = {};

	    counts["true"] = 0;
	    counts["false"] = 0;

	    var truth = [];
	    var fal = [];
	    for(i = 0; i< dataset.length ; i++){
		var bin = criteria(dataset[i]);
		dataset[i]["criteria"] = bin;
		if(bin==true)
		    truth.push(dataset[i]);
		else
		    fal.push(dataset[i]);
	    }
	    var master =dataset;
	    var testing = master.slice( Math.round(master.length*0.9) , master.length);

	    if(truth.length >= fal.length){
		dataset = fal.concat(truth.slice(0,fal.length));
	    }
	    else
		dataset = truth.concat(fal.slice(0,truth.length));
	    if(truth.length === 0  || fal.length ===0)
		return function(d){ return {"truth":null, "false":null, "total":null, "error": "criteria doesn't appear in training set"};};
	    
	    for(i = 0; i< Math.round(dataset.length * 0.9) ; i++){
		var bin = criteria(dataset[i]);
		for(j = 0; j< dimens.length; j++){
		    dataset[i][dimens[j]] = maps[dimens[j]]["map"](dataset[i][dimens[j]]);

		    if(!(dimens[j] in probs[String(bin)])){
                        probs[String(bin)][dimens[j]] = {};
                    }
                    
		    if(dataset[i][dimens[j]] in probs[String(bin)][dimens[j]]){
			probs[String(bin)][dimens[j]][dataset[i][dimens[j]]]+=1;

		    }
		    else{
			probs[String(bin)][dimens[j]][dataset[i][dimens[j]]] = 1;
		    } 
		    if(!(dimens[j] in probs["total"])){
                        probs["total"][dimens[j]] = {};
                    }
                    
		    if(dataset[i][dimens[j]] in probs["total"][dimens[j]]){
			probs["total"][dimens[j]][dataset[i][dimens[j]]]+=1;

		    }
		    else{
			probs["total"][dimens[j]][dataset[i][dimens[j]]] = 1;
		    }
		    counts[String(bin)] +=1;
		    counts["total"] +=1;
		}

	    }

	    

	    var algo = {};
	    var error = 0.0;
	    var classify = classifier(probs,maps,dimens,alpha,beta);
	    for( j =0; j<testing.length; j++){
		var test = testing[j];
		var c = classify(test);
		var prediction  = c["true"] > c["false"] ? true : false;
		
		error += prediction === test.criteria ? 0 : 1;
		
		} 
	    algo.classifier = classify;
	    algo.error = error/testing.length;
	    return algo;

    }
    else if(criteria in this.data.dimensions && this.data.dimensions[criteria].space === "discrete"){
	var classifiers = {};
	var vals = {};
	for(i = 0; i < dataset.length; i++){
	    vals[dataset[i][criteria]] = 0;
	}


	for(label in vals){
	    var crit = generateCriteria(criteria,label); 
	    classifiers[label] = this.naiveBayes(dimens, crit, alpha, beta);
	}
	var classify = multivariateClassifier(classifiers);
	console.log(dataset[0]);
	console.log(classify(dataset[0]));
	return classify;
    }
    else{
	console.log("stuf");
	return null;
    }
    
    function generateCriteria(criteria,label){
	/* comparison converts to strings because # 0 is falsy and causes false negatives */
	var crit = function(x){ return String(x[criteria]) === String(label); };
	return crit;
    }

    function multivariateClassifier(classifiers){
	var multi = function(test){
	    var solutions = {};
	    var prod = 1.0
	    var error = 0.0;
	    count = 0;
	    for(lab in classifiers){
		var  e = classifiers[lab]["error"];
		prod *= e;
		error+=e;
		count +=1;
                var sol = classifiers[lab]["classifier"](test);
		var pos = sol["true"];
		var neg = sol["false"];

		solutions[lab] = sol["true"] - sol["false"];
		
	    }

	    solutions["error"] = error/count;
	    solutions["independent_error"] = prod;
	    return solutions;
	};
	return multi;

    }
    function classifier(probs,maps,dimens,alpha, beta){
	return function(test){

	    result = {};
	    for(label in probs){
		var w_j = 0.0;
		var w_0 =0.0;
		var px = 1;
		var score = 0.0;

		for(i = 0; i < dimens.length; i++ ){
		    var dimen = dimens[i];
		    if(dimen in test){

			var x = maps[dimen]["map"](test[dimen]);
			var a  = probs[label][dimen][x] != null ? probs[label][dimen][x] + alpha : alpha;
			var b  = probs["total"][dimen][x] != null ? probs["total"][dimen][x] + beta : beta;
			var theta =  a /b;
			w_j +=  Math.log(theta / (1 - theta));
			w_0 += Math.log( 1 - theta);

		    }
		}

		var pxy = Math.exp(w_j + w_0);
		result[label] = pxy;
		
	    }
	    return result;
	};
    } 
    function generateMap(values){
	    var max = Math.max.apply(Math, values);
	    var min = Math.min.apply(Math, values);
	    var x_step = (max - min) / 10;
	    return function(s){
		var mult = Math.round(s/x_step);
		return parseFloat((mult*x_step).toPrecision(2));
	    };

    }
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
    h = 450 - m[0] - m[2];
    var color = d3.scale.category20b();
    for( i=0; i < 10;i++){
        color(i);
    }
    var c = '';
    for( i = 0; i< this.data.dimensions.length; i++){
        c = c + this.data.dimensions[i];
    }
    var col = c.length % 20;


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
    .attr("id",tag.replace(".",""))
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
    .style("stroke", color(col))
    .attr("title", function(d){ return d.magnitude})
    .on("mouseover", function(d){
            d3.select(this).transition().duration(100)
            .style("stroke","#F00" );
            return true;
        })
    .on("mouseout", function(d){
            d3.select(this).transition().duration(100)
            .style("stroke", color(col))
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
    .attr("class", "axis_parallel")
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
Fiddle.prototype.stat = function(dimen){
    var epoch = function(utcSeconds){
	var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
	d.setUTCSeconds(utcSeconds);
	return d;
    };

    var dataset = this.data.dataset;
    var dimension = this.data.dimensions[dimen];
    var space = dimension.space;
    var type = dimension.type;
    var mean = 0.0;
    var mode = 0.0;
    var variance = 0.0;
    var distinct = 0; // as percent
    var vals = [];
    var hist = {};
    var min =  2147483646;
    var max = -2147483646;
    var m = 0.0;
    var s = 0.0;
    for (i=0; i< dataset.length; i++){
	var temp = dataset[i][dimen];
	vals.push(temp);
	if(temp in hist)
	    hist[temp] += 1;
	else
	    hist[temp] = 1;
	if(space==="continuous" || type==="number"){
	    min = temp < min ? temp :min;
	    max = temp> max ? temp : max;
	    mean = (mean *(vals.length -1 )  + temp )/vals.length;
	    
	    var t = m;
	    m = i===0 ? temp : m + ( temp - m)/i;
	    s = i===0 ? s : s + (temp - m)*(temp-t);
	}

    }
    variance = s / (dataset.length -1.0);

    var count = 0;
    for(key in hist){
	if(hist[key] > count){
	    count = hist[key];
	    mode = key;
	}
    }
    result = {};
    result.distinct = vals.unique().length *1.0 / vals.length;
    result.mode = type==="time"  ? epoch(mode) : mode;
    result.type = type;
    result.count = vals.length;
    if(space==="continuous" || type==="number"){
	result.variance = variance;
	result.std = Math.sqrt(variance);
	result.mean = type ==="time" ? epoch(mean) : mean;
	result.max = type ==="time" ? epoch(max) : max;
	result.min = type ==="time" ? epoch(min) : min;
    }


    return result;

};
Fiddle.prototype.linearRegression = function(a,b){
    if(this.data.dimensions[a].space != "continuous" || this.data.dimensions[b].space !="continuous")
	return null;
    var dataset = this.data.dataset;
    var x = 0.0;
    var x_list = [];
    var y = 0.0;
    var sxy = 0.0;
    var sxx = 0.0;
    var m = 0.0;
    var c = 0.0;
    for(i =0; i< dataset.length; i++){
	var x_ = dataset[i][a];
	var y_ = dataset[i][b];

	
	y = (y*i + y_)/(i + 1);
	x = (x*i + x_)/(i + 1);

    }
    for(i =0; i< dataset.length; i++){
	var x_ = dataset[i][a];
	var y_ = dataset[i][b];

	sxy+= (x_ - x) * (y_ - y);
	sxx+= (x_ - x)*(x_ - x);
    }
    m = sxy /sxx;
    c = y - m*x;
    var func = function(t){return m*t +c};

    return func;


};
Fiddle.prototype.correlation = function(a,b){

    var dataset = this.data.dataset;
    var sxy  = 0.0;

    var x = 0.0;
    var y = 0.0;

    var sxx =0.0;
    var syy = 0.0;

    for(i =0; i< dataset.length; i++){
	var x_ = dataset[i][a];
	var y_ = dataset[i][b];

	y = (y*i + y_)/(i + 1);
	x = (x*i + x_)/(i + 1);

    }
    for(i =0; i< dataset.length; i++){
	var x_ = dataset[i][a];
	var y_ = dataset[i][b];

	sxy+= (x_ - x) * (y_ - y);
	sxx += (x_ - x) * (x_ - x);
	syy += (y_ - y) * (y_ - y);

    }

    return sxy/ Math.sqrt(sxx*syy);
};Fiddle.prototype.trend = function (x_dim, trends ,tag, height, width, margin){
    

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
    .attr("id",tag.replace(".",""))
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

