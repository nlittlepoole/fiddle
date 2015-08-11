Fiddle.prototype.logisticRegression = function(dimens, criteria){
    var dataset = this.data.dataset.slice();

    var maps = {};

    var alpha = .05;
    var beta = {};
    var features = {};
    for (i =0; i < dataset.length; i++){
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

	    var truth = [];
	    var fal = [];
	    for(i = 0; i< dataset.length ; i++){
		var bin = criteria(dataset[i]);
		dataset[i]["criteria"] = bin;
		
		for(j =0; j < dimens.length; j++){
		    var k = dimens[j];
		    var map = maps[k]["map"];
		    var v = map(dataset[i][k]);
		    
		    if( k in features){
			if(v in features[k])
			    features[k]["values"][v] = .1;
			else{
			    features[k]["values"][v] = .1;
			}
		    }
		    else{
			features[k] = {"values": {}, "map":map};
		       features[k]["values"][v] = 0.1;
		   }
		}
		if(i< dataset.length*.9){
		    if(bin==true)
			truth.push(dataset[i]);
		    else
			fal.push(dataset[i]);
		}
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

	    alpha = truth.length / master.length;


	    beta = features;
	    /*for(j =0; j<20; j++){
		for(i=0; i < dataset.length; i++){

		features = gradientDescent(alpha, features,10, dataset[i]);
	    }
	    } */
	    beta = batchGradientDescent(alpha, beta, 1, dataset);//features;
	    

	    var tester = generateClassifier(alpha, beta);
	    var err = {};
	    
	    for(i =0; i <testing.length; i++){
		for(j =0; j<20; j++){
		    var k = String(j*.05 + .05) + " threshold";
  		     var res = tester(testing[i]) > j *.05 + .05 ? true: false;
		     err[k] =   err[k]!= null ? err[k] : 0;
		     err[k]= res === testing[i]["criteria"] ? (err[k]*i+ 0)/(i+1) : (err[k]*i + 1)/(i+1) ;
		}
	    }

	    var result = {};
	    result["errors"] = err;
	    result["classifier"] = tester;
	    return result;
    }
    else if(criteria in this.data.dimensions && this.data.dimensions[criteria].space === "discrete"){
	var classifiers = {};
	var vals = {};

        for(i = 0; i < dataset.length; i++){
            vals[dataset[i][criteria]] = 0;
        }

	/*
	var index = Math.round(Math.random() * dataset.length);
	console.log(index)
	var test = dataset[index];
	console.log(test); */
        for(label in vals){
            var crit = generateCriteria(criteria,label);
            classifiers[label] = this.logisticRegression(dimens, crit);
	    //console.log(label + " :" +classifiers[label]["classifier"](test));
        }


	return classifiers;
    }
    else{
	console.log("stuff");
	return null;
    }

    function batchGradientDescent(alpha, beta, step, dataset){
	    var result = beta;   
	    var delta = 1;
	    var prev = 0;
	    while(delta > .001){


	    var tester = generateClassifier(alpha, beta);
	    var error = 0;
 
	    for(i =0; i< dataset.length; i++){
		var test = dataset[i];
		var prob = tester(test);
		var err = test["criteria"] === true ? 1 - prob : 0 - prob;
		error += Math.abs(err);
	        for(feature in beta){
		    var map = beta[feature]["map"];
		    var val = map(test[feature]);
		
		    var a = beta[feature]["values"][val];
		    partial = -1*err *( a *Math.exp(a))/ Math.pow(( Math.exp(a)+ 1)  ,2);
		    var gradient = partial * step;

        	    result[feature]["values"][val] = result[feature]["values"][val] - gradient;
		}
	    }
	    delta = prev === 0 ? delta : 1 - (error /prev);
	    prev = error;
	}
	return result;
		


    }

    function gradientDescent(alpha, beta, step, test){
	    var tester = generateClassifier(alpha, beta);
	    var prob = tester(test);

	    var result = beta;
	    var err = test["criteria"] === true ? 1 - prob : 0 - prob;
	    for(feature in beta){
		var map = beta[feature]["map"];
		var val = map(test[feature]);
		
		var a = beta[feature]["values"][val];
		partial = -1*err *( a *Math.exp(a))/ Math.pow(( Math.exp(a)+ 1)  ,2);
		var gradient = partial * step;

		result[feature]["values"][val] = a - gradient;
		
	    }
	    return result;
		


    }
    function generateClassifier(alpha, beta){

	var func = function(test){

	    var sum = 0.0;
	    for(feature in beta){
		var map = beta[feature]["map"];
		var val = map(test[feature]);
		sum+= beta[feature]["values"][val];
	    }
	    var denom = 1 + Math.exp(-1*(alpha + sum));
	    return 1.0/denom;
	};
	return func;
    }
    
    function generateCriteria(criteria,label){
	/* comparison converts to strings because # 0 is falsy and causes false negatives */
	var crit = function(x){ return String(x[criteria]) === String(label); };
	return crit;
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