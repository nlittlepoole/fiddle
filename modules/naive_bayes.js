Fiddle.prototype.naiveBayes = function(dimens, criteria, alpha, beta){
    var dataset = this.data.dataset;

    var maps = {};
    var probs = {};
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
	    var max = Math.max.apply(Math, values);
	    var min = Math.min.apply(Math, values);
	    var x_step = (max - min) / 10;
	    maps[dimens[i]]["map"] = function(s){
		var mult = Math.round(s/x_step);
		return parseFloat((mult*x_step).toPrecision(2));
	    };
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

	for(i = 0; i< dataset.length; i++){
	    var bin = criteria(dataset[i]);
	    dataset[i]["criteria"] = bin;
	    for(j = 0; j< dimens.length; j++){
		dataset[i][dimens[j]] = maps[dimens[j]]["map"](dataset[i][dimens[j]]);
		if(dataset[i][dimens[j]] in probs[String(bin)]){
		    probs[String(bin)][dataset[i][dimens[j]]] +=1;
		}
		else{
		    probs[String(bin)][dataset[i][dimens[j]]] = 1;
		} 
                if(dataset[i][dimens[j]] in probs["total"]){
                    probs["total"][dataset[i][dimens[j]]] +=1;
		}
                else{
		    probs["total"][dataset[i][dimens[j]]] = 1;
                }
	    }

	}
	console.log(probs);
    }
    else{
	console.log("stuf");
    }

};