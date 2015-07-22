# Fiddle.js

Fiddle.js is a javascript data sandbox so that you can fiddle with your data and find the best insights

  - Uses a standardized json format so that anything can be plugged into fiddle
  - View overview parallel coordinate view to have an idea of where to start
  - Pick any combination of dimensions to get dynamic visualizations providing easy insights [WIP]
  - Let Fiddle auto cluster and predict based on your data [To be done]


> It's difficult to imagine the power that you're going to have when so many
> different sorts of data are available.

Fiddle is built to be easily deployable and useful for creating dashboards useable by non technical and non data scientist indivduals. Anyone should be able to leverage the power of the data in front of them.

### Demo:
Play around with a [demo] app I made called [Twiddle] built on top of Fiddle.js

### Version
0.2.0

### Tech

Fiddle uses just one javascript library.

* [D3] - Data Driven Documents

### Build Instructions 
```
./build.sh
cp compiled.js ../fiddle.js
```
^then use the fiddle.js in the above directory in your script
You can also use the official [release] version. Note Fiddle is still pre-alpha.

### Usage 
```javascript
<script src="fiddle.js"></script>

var data = {
            "dataset":[
                {"a":1,"b":2,"c":3,"d":"test"},
                {"a":2,"b":1448801888,"c":1,"d":"test"},
                {"a":1,"b":3,"c":2,"d":"firefly"},
                {"a":3,"b":0,"c":5,"d":"okay"} ],
            "dimensions":     
                {"a":{ type: "number", space:"continuous"},
                 "b":{ type: "time", space: "discrete"},
                 "c":{ type: "number", space:"discrete"},
                 "d": {type: "string", space: "discrete"}
            }
};
test = new Fiddle(data);
test.polar();
```

### Fiddascheme (Fiddle JSON Schema) 
```json
{
        "format":"table",
        "dimensions":     
            {"column_name1":{ "type": "number", "space": "continuous"},
             "column_name2":{ "type": "string", "space": "discrete" },
             "column_name3":{ "type": "number", "space": "discrete"},
             "column_name4":{ "type": "time", "space": "discrete"}
            },
    "dataset":[
                {
                    "column_name1":1,
                    "column_name2":"Some String",
                    "column_name3":0,
                    "column_name4":"Epoch Timestamp"
                },
                {
                    "column_name1":0,
                    "column_name2":"String for second entry",
                    "column_name3":1,
                    "column_name4":"Another Epoch Timestamp"
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
  - Update visuals
  - Provide field statistics
  - Build learning and grouping

### Maintainers:
[Niger Little-Poole]

License
----

MIT


[Niger Little-Poole]:http://nigerlittlepoole.com
[@thomasfuchs]:http://twitter.com/thomasfuchs
[D3]:http://d3js.org
[release]: https://github.com/nlittlepoole/fiddle/releases
[demo]: http://nlittlepoole.github.io/fiddle/
[Twiddle]: http://nlittlepoole.github.io/fiddle/
