Fiddle.prototype.kmeans = function(k, dimens){
    k = 2;
    dimens = this.data.dimensions;
    var dataset = this.data.dataset;
    for(dimen in dimens){
	if(dimens[dimen]["space"] === "continuous" || dimens[dimen]["type"] ==="number"){
	    var max = -200000000;
	    var min  = 2000000000;
	    for(i=0; i <dataset.length; i++){
	        max = dataset[i][dimen] > max ? dataset[i][dimen] : max;
		min = dataset[i][dimen] < min ? dataset[i][dimen] : min;
	    }
	    dimens[dimen]["range"] = max - min;
        }
    }
    var cens = [{"Photos": 0, "Comics": 2, "Words": 800, "Time": 22, "Click Rate": 0.3212601397060457}, {"Photos": 3, "Comics": 0, "Words": 200, "Time": 7 , "Click Rate": 0.8212601397060457}];

    var centroids = [];
    var avgs = [];
    var res = [];
    for(j =0; j <10; j++){
        for(i = 0; i < k ; i++){
	    avgs[i] = {};
	    cens[i]["&&res&&"] = i ;
	    centroids.push(cens[i]);
       } 

        for(i = 0; i < dataset.length; i++){
	    var near = nearest(centroids,dataset[i],dimens);
	    for(key in dataset[i]){
	        avgs[near["&&res&&"]][key] = avgs[near["&&res&&"]][key] != null ? avgs[near["&&res&&"]][key] : [];
	        avgs[near["&&res&&"]][key].push(dataset[i][key]);
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
		temp[key] = this.data.dimensions[key]["space"] === "continuous" || this.data.dimensions[key]["type"] ==="number" ?  avgs[i][key].average() : avgs[i][key].mode()  ; 
	    }
	    result.push(temp);
	}
	return result;
    }

    function nearest(centroids, test, dimens){
	var min = 1000000;
	var result = null;
	for(var i =0; i < centroids.length; i++){
	    var dist = euclidianDistance(test, centroids[i]);
	    if(dist  < min){
		result = centroids[i];
		min = dist;
	    }
	}
	
	return result;
    }
    function euclidianDistance(a,b){
	sum = 0;
	for(d in a){

	    var diff = this.data.dimensions[d].type=="number" || dimens[d].space=="continuous" ? (a[d] - b[d])/dimens[d]["range"]  : (a[d]===b[d] ? 0 : 1 )   ;
	    sum += Math.pow(diff , 2);
	}
	return Math.sqrt(sum);
    }


};