Fiddle.prototype.kmeans = function(k, weights,dataset){
    feats = !weights ? Object.keys(this.data.dimensions) : Object.keys(weights); 
    weights = !weights ? {} : weights;
    k = !k ?  Math.ceil(Math.sqrt(feats.length / 2 )) : k;

    var dimens = {};
    for(i =0; i < feats.length; i++){
	dimens[feats[i]] = this.data.dimensions[feats[i]];
	weights[feats[i]] = !weights[feats[i]] ? 1 : weights[feats[i]] ;
    }

    dataset = !dataset ? this.data.dataset : dataset;
    for(dimen in dimens){
	if(dimens[dimen]["space"] === "continuous" || dimens[dimen]["type"] ==="number"){
	    var max = -200000000;
	    var min  = 2000000000;
	    for(i=0; i <dataset.length; i++){
	        max = dataset[i][dimen] > max ? dataset[i][dimen] : max;
		min = dataset[i][dimen] < min ? dataset[i][dimen] : min;
	    }
	    dimens[dimen]["range"] = max - min > 0 ? max - min  : (max !=0 ? max : 1) ;
        }
    }
    var cens = [];
    for(i = 0; i< k; i++){
	var index = Math.round(Math.random()* (dataset.length -1 ));
	cens.push(dataset[index]);
    }
    var centroids = [];
    var avgs = [];
    var res = [];
    for(j =0; j <5; j++){
        for(i = 0; i < k ; i++){
	    avgs[i] = {};
	    cens[i]["&&res&&"] = i ;
	    centroids.push(cens[i]);
       } 

        for(i = 0; i < dataset.length; i++){
	    var near = nearest(centroids,dataset[i],dimens, weights);
	    if(near){
	    for(key in dataset[i]){
	        avgs[near["&&res&&"]][key] = avgs[near["&&res&&"]][key] != null ? avgs[near["&&res&&"]][key] : [];
	        avgs[near["&&res&&"]][key].push(dataset[i][key]);
	    }
	    }
        }				   
	        
        cens = average(avgs);
	res = cens;
	avgs = [];
    }
    return cens;
    function average(avgs){
	var result = [];
	for(i =0 ; i<avgs.length; i++){
	    var temp = {};
	    for(key in avgs[i]){
		if(key != "&&res&&"){
		    temp[key] = this.data.dimensions[key]["space"] === "continuous" || this.data.dimensions[key]["type"] ==="number" ?  avgs[i][key].average() : avgs[i][key].mode()  ; 
		}
	    }
	    result.push(temp);
	}
	return result;
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
	    if(d != "&&res&&"){
		var diff = this.data.dimensions[d].type=="number" || dimens[d].space=="continuous" ? weights[d] * (a[d] - b[d])/dimens[d]["range"]  : (a[d]===b[d] ? 0 : 1 )   ;
		sum += Math.pow(diff , 2);
	    }
	}
	return Math.sqrt(sum);
    }


};