# Fiddle.js

Fiddle.js is a javascript data sandbox so that you can fiddle with your data and find the best insights maintained by me [Niger Little-Poole]

  - Uses a standardized json format so that anything can be plugged into fiddle
  - View overview parallel coordinate view to have an idea of where to start
  - Pick any combination of dimensions to get dynamic visualizations providing easy insights [WIP]
  - Let Fiddle auto cluster and predict based on your data [To be done]


> It's difficult to imagine the power that you're going to have when so many
> different sorts of data are available.

Fiddle is built to be easily deployable and useful for creating dashboards useable by non technical and non data scientist indivduals. Anyone should be able to leverage the power of the data in front of them.

### Version
0.0.1

### Tech

Fiddle uses just one javascript library.

* [D3] - Data Driven Documents

### Installation
```
<script src="fiddle/fiddle.js"></script>
```

### Usage 
```javascript
var data = {
            "dataset":[
                {"a":1,"b":2,"c":3,"d":"test"},
                {"a":2,"b":0,"c":1,"d":"test"},
                {"a":1,"b":3,"c":2,"d":"firefly"},
                {"a":3,"b":0,"c":5,"d":"okay"} ],
            "dimensions":     
                {"a":{ type: "number"},
                 "b":{ type: "number"},
                 "c":{ type: "number"},
                 "d": {type: "string"}
            }
};
test = new Fiddle(data);
test.polar();
```

### Fiddlescheme (Fiddle JSON Schema) 
```json
{
        "format":"table",
        "dimensions":     
            {"column_name1":{ type: "number"},
             "column_name2":{ type: "string"},
             "column_name3":{ type: "number"},
             "column_name4": {type: "string"}
            },
    "dataset":[
                {
                    "column_name1":1,
                    "column_name2":"Some String",
                    "column_name3":0,
                    "column_name1":"Another String"
                },
                {
                    "column_name1":0,
                    "column_name2":"String for second entry",
                    "column_name3":1,
                    "column_name1":"Another String for second entry"
                },
            ]
}
```
For right now there is only support for tables, in the future a graph schema will be available

### Development

Want to contribute? Great!

Feel free to make a pull request to this repository. This project is being built with solely javascript and d3, so avoid using libraries/frameworks outside of these. 


### Todo's

  - Write Tests
  - More chart types
  - Pick any combination of dimensions to get dynamic visualizations providing easy insights
  - Build learning and 

License
----

MIT


[Niger Little-Poole]:http://nigerlittlepoole.com
[D3]:http://d3js.org

