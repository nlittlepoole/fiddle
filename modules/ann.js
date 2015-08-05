Fiddle.prototype.som = function(k, weights, step){

    feats = !weights ? Object.keys(this.data.dimensions) : Object.keys(weights); 
    weights = !weights ? {} : weights;
    k = !k ?  Math.ceil(Math.sqrt(feats.length / 2 )) : k;
    step = !step ? .2  : step;
    var dimens = {};
    for(i =0; i < feats.length; i++){
	dimens[feats[i]] = this.data.dimensions[feats[i]];
	weights[feats[i]] = !weights[feats[i]] ? 1 : weights[feats[i]] ;
    }

    var dataset = this.data.dataset;
    for(dimen in dimens){
	if(dimens[dimen]["space"] === "continuous" || dimens[dimen]["type"] ==="number"){
	    var max = -200000000;
	    var min  = 2000000000;
	    var distincts =[];
	    for(i=0; i <dataset.length; i++){
	        max = dataset[i][dimen] > max ? dataset[i][dimen] : max;
		min = dataset[i][dimen] < min ? dataset[i][dimen] : min;
		distincts.push(dataset[i][dimen]);
	    }
	    dimens[dimen]["distincts"] = distincts.unique();
	    dimens[dimen]["range"] = max - min;
        }
    }
    var cens = [];
    var neurons = Object.keys(this.data.dimensions).length * 8;
    for(i = 0; i< neurons; i++){
	var index = Math.round(Math.random()* dataset.length);
	cens.push(dataset[index]);
    }
    var centroids = [];
    var avgs = [];
    var res = [];
    for(j =0; j <1; j++){
        for(i = 0; i < neurons ; i++){
	    avgs[i] = {};
	    var temp = clone(cens[i]);
	    for(key in temp){
		temp[key + "_weights"] = {};
		var max = 0;
		for(r =0; r < dimens[key]["distincts"].length; r++){
		    var val = dimens[key]["distincts"][r];
		    var ran = Math.random();
		    temp[key + "_weights"][val] = ran;
		    if(ran > max){
			max = ran;
			temp[key] = val;
		    }
		}
		temp[key + "_weights"]["max"] = max;
	    }
	    temp["&&res&&"] = i ;
	    centroids.push(temp);
       } 

        for(i = 0; i < dataset.length; i++){
	    var near = nearest(centroids,dataset[i],dimens, weights);
	    centroids = update(centroids,dataset[i], near);

        }				   
	
    }

    for(i =0; i < centroids.length; i++){
	var temp = {};
	for(key in weights){
	    temp[key]= centroids[i][key];
	}
	res.push(temp);
    }

    return this.kmeans(k, weights, res);

    function update(centroids, test, closest){
	var result = [];
	var norm = 0.0;
	var statik = clone(closest);
	for( key in weights){
	    norm+= weights[key];
	}
	norm = Math.sqrt(norm);
	for(var i =0; i < centroids.length; i++){
	    var dist = 1 - euclidianDistance(statik, centroids[i], weights) / norm;  
	    if(dist > .65)
		result.push( mid(test, centroids[i], dist  ));
	    else
		result.push(centroids[i]);
	}
	
	return result;
    }

    function mid(test, closest, weight){
	for(key in test){
	    var val = test[key];
	    closest[key+"_weights"][val] += .5 * weight;
	    
	    if(closest[key+"_weights"]["max"] < closest[key+"_weights"][val]){
		closest[key+"_weights"]["max"] = closest[key+"_weights"][val];
		closest[key] = val;
	    }

	}
            return closest;
    }

     

    function nearest(centroids, test, dimens,weights){
	var min = 1000000;
	var result = null;
	for(var i =0; i < centroids.length; i++){
	    var dist = euclidianDistance(test, centroids[i], weights);
	    if(dist  < min){
		result = centroids[i];
		min = dist;
	    }
	}
	
	return result;
    }
    function euclidianDistance(a,b,weights){
	sum = 0;
	for(d in a){
	    if(d != "&&res&&" && ! (d.indexOf("_weights") >- 1 )){
		var diff = this.data.dimensions[d].type=="number" || dimens[d].space=="continuous" ? weights[d] * (a[d] - b[d])/dimens[d]["range"]  : (a[d]===b[d] ? 0 : 1 )   ;
		sum += Math.pow(diff , 2);
	    }
	}
	return Math.sqrt(sum);
    }


};