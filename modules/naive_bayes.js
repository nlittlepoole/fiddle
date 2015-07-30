Fiddle.prototype.naiveBayes = function(dimens, criteria, alpha, beta){
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
};