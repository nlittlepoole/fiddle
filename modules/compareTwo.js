Fiddle.prototype.heatmap = function(x,y,tag, height, width, margin){
    var existing = d3.select(tag);
    existing.selectAll("svg").remove();

    margin = margin == null ? {top: 20, right: 20, bottom: 50, left: 100} : margin;

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
	    return mult*step;
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
	    return mult*step;
	};
    }
    else{
	y_map = function(s){return s;};
    }

    for( i = 0; i< unmerged.length; i++){
	hor.push(x_map(unmerged[i][x]));
	ver.push(y_map(unmerged[i][y]));
	var key = String(x_map(unmerged[i][x])) + String(y_map(unmerged[i][y]));
	console.log(key);
       	if(key in merged){
	    console.log("dup");
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
    horizontal.sort(); vertical.sort();
    var gridSize = 76;//Math.floor(width / horizontal.length);
    var buckets = 9; //denotes heat scale
    var legendElementWidth = width / buckets ;

    console.log(horizontal);
    console.log(vertical);

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
		   .attr("y", height)
		   .attr("width", legendElementWidth)
		   .attr("height", gridSize / 2)
		   .style("fill", function(d, i) { return colors[i]; });

	       legend.append("text")
		   .attr("class", "mono")
                   .html(function(d) { return "&ge; " + Math.round(d); })
		   .attr("x", function(d, i) { return legendElementWidth * i; })
		   .attr("y", height + gridSize/4)
                   .style({"fill":"#aaa"});

    this.figures[tag] = Fiddle.prototype.heatmap.bind(this,x,y,tag,height ,width ,margin);
    return svg;
};