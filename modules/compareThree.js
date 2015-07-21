Fiddle.prototype.scatterplot3D = function(x_dim,y_dim,z_dim, tag, height, width, margin){

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



};