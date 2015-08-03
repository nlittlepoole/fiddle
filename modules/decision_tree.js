Fiddle.prototype.decisionTree = function(dimen, condition){
    var dataset = [];
    var dimens = clone(this.data.dimensions);

    var funcs = {};
    var X = 0;
    for( i =0; i <this.data.dataset.length; i++){
	var temp = clone(this.data.dataset[i]);
	dataset.push(temp);
	for(key in dataset[i]){
	    dimens[key]["vals"] = !dimens[key]["vals"] ? [] : dimens[key]["vals"];
	    dimens[key]["vals"].push(dataset[i][key]);
	}
	var bin = condition(dataset[i]);
	dataset[i]["criteria"] = bin;
	X += bin ? 1 :0;
    }
    X = X/ dataset.length;
    for(key in dimens){
	if(dimens[key]["space"] ==="continuous" ||dimens[key]["type"] ==="number"){
	    funcs[key] = rangeDecisions(key, dimens[key]["vals"]);
	}
	else{
	    funcs[key] = equalDecisions(key, dimens[key]["vals"]);
	}

    }
    
    return tree(funcs, X, dataset);



    function tree( funcs, X, dataset,depth){
	depth = !depth ? 0 : depth;
	if(depth >4)
	    return "Leaf";
	var results = {};
	var max = -2000;
	for(key in dimens){
	    if(key!=dimen){
		var pos = H(funcs[key], dataset, X);
		if(pos["IG"] > max){
		    max = pos["IG"];
		    results["root"] = pos;
		}

		var neg = H(funcs[key], dataset, 1- X);
		if(neg["IG"] > max){
		    max= neg["IG"];
                    results["root"] = neg;
                }
	    }
	}
        if(max <=0)
            return "Leaf";
	var truth = results["root"]["funcs"]["vals"]["true"].concat(results["root"]["funcs"]["vals"]["false"]);
	var fal = results["root"]["funcs"]["vals"]["rejected"].concat(results["root"]["funcs"]["vals"]["missed"]);


	var x = results["root"]["funcs"]["vals"]["true"].length  / (results["root"]["funcs"]["vals"]["true"].length  + results["root"]["funcs"]["vals"]["false"].length);
	var y = results["root"]["funcs"]["vals"]["missed"].length  / (results["root"]["funcs"]["vals"]["rejected"].length  + results["root"]["funcs"]["vals"]["missed"].length);

	var deep = depth + 1;


	results["true"] = tree(funcs, x, truth, deep );
	results["true"] = results["true"] ==="Leaf" ? ( x >.5 ? true  :false   )  : results["true"];

	if(results ==="Leaf" || results ==="Leaf")
	    console.log(x + "," + y);
	
	results["false"] = tree(funcs, x, fal, deep);
	results["false"] = results["false"] ==="Leaf" ? ( y >.5 ? true  : false   )  : results["false"];

	return results;
    }


    function H(lst, dataset, X){
	var funcs = clone(lst);
	for(i = 0; i< dataset.length; i++){
	    for(f in funcs){
		var check = funcs[f]["func"](dataset[i]);
		if(check){
		    var addend = check   && dataset[i]["criteria"] ? true : false;

		    if(!addend)
			funcs[f]["vals"]["false"].push(dataset[i]);
		    else
			funcs[f]["vals"]["true"].push(dataset[i]);
		}
		else{
                    var addend = dataset[i]["criteria"];

                    if(!addend)
                        funcs[f]["vals"]["missed"].push(dataset[i]);
                    else
                        funcs[f]["vals"]["rejected"].push(dataset[i]);;
                }
	    }
	}

	var IG = h(X);
	var min = 10000.0;
	var func = null;
	var def = null;
	for( f in funcs){
	    funcs[f]["IG"] = ((funcs[f]["vals"]["false"].length + funcs[f]["vals"]["true"].length)/dataset.length) * h( funcs[f]["vals"]["true"].length/(funcs[f]["vals"]["false"].length + funcs[f]["vals"]["true"].length) );
	    if(funcs[f]["IG"] < min && funcs[f]["vals"]["true"].length> 1){
		func = funcs[f];
		min = funcs[f]["IG"];
		def = f;
	    }
	}
	return {"IG": IG - min, "funcs":func, "def" : def};
    }

    function h(x){
	var y = 1 -x;
	var h = (-1*x*Math.log2(x)) - (y*Math.log2(y));  
	return !h ? 0 : h;
    }

    function equalDecisions(dimen ,values){
	var funcs = {};
        var choices = values.unique();
	for(i =0; i < choices.length; i++){
	    var k = dimen + " = " + choices[i];
	    funcs[k] = {"func": decision(dimen, choices[i], true), "vals": {"true" : [], "false": [], "rejected":[], "missed": [] } };
	}
        return funcs;

    }

    function rangeDecisions(dimen ,values){
	var funcs = {};

        var max = Math.max.apply(Math, values);
        var min = Math.min.apply(Math, values);
        var x_step = (max - min) / 10;
	for(i =0; i < 10; i++){

	    var k = dimen + " > " + x_step*i;
	    funcs[k] = {"func": decision(dimen, x_step*i), "vals": {"true" : [], "false": [], "rejected":[], "missed": [] } };
	    var k = dimen + " < " + x_step*i;
	    funcs[k] = {"func": decision(dimen, x_step*i, false, true), "vals": {"true" : [], "false": [] , "rejected":[], "missed": []} };

	}
        return funcs;

    }
    function decision(key, val, eq, less){
	    return !eq ? ( !less ? function(x){return x[key] >= val} :  function(x){return x[key] <= val}  ): function(x){ return x[key]===val} ;
	}
};