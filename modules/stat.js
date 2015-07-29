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