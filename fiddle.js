function Fiddle( json){
    this.data = clone(json);
    this.master = clone(json);
    this.figures = {}
}

Fiddle.prototype.reset = function (){
    this.data = clone(this.master);
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

Fiddle.prototype.reset = function(){
    this.data = clone(this.master);
};

Fiddle.prototype.clear = function (){
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
    
    return this.parallel(tag);
};