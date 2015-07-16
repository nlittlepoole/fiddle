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
