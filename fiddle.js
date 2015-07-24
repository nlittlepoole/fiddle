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

};