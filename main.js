var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var faker = require("faker");
var fs = require("fs");
faker.locale = "en";
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["climbing-grade.js"];
	}
	var filePath = args[0];

	constraints(filePath);

	generateTestcases(filePath)

}

var engine = Random.engines.mt19937().autoSeed();

function createConcreteIntegerValue( greaterThan, constraintValue )
{
	if( greaterThan )
		return Random.integer(constraintValue,constraintValue+10)(engine);
	else
		return Random.integer(constraintValue-10,constraintValue)(engine);
}

function Constraint(properties)
{
	this.ident = properties.ident;
	this.expression = properties.expression;
	this.operator = properties.operator;
	this.value = properties.value;
	this.funcName = properties.funcName;
	// Supported kinds: "fileWithContent","fileExists"
	// integer, string, phoneNumber
	this.kind = properties.kind;
}

function fakeDemo()
{
	console.log( faker.phone.phoneNumber() );
	console.log( faker.phone.phoneNumberFormat() );
	console.log( faker.phone.phoneFormats() );
}

var functionConstraints =
{
}

var mockFileLibrary = 
{
	pathExists:
	{
		'path/fileExists': {}
	},
	fileWithContent:
	{
		pathContent: 
		{	
  			file1: 'text content',
		}
	}
};

function paraObject() {
return {'params': ''}
}

function permuteConst(constrained, paramId, length, newparams, arr)
{
	if (paramId >= length)
	{
		var a = JSON.parse(JSON.stringify(newparams));;
		arr.push(a);
		return;	
	}
	if (constrained[paramId].length == 0)
	{	
		newparams[paramId] = '';
		permuteConst(constrained, paramId + 1, length, newparams, arr);
	}
	
	for (var i=0; i < constrained[paramId].length; i++)
	{
		newparams[paramId] = constrained[paramId][i];
		permuteConst(constrained, paramId+1, length, newparams, arr);
	}
}

function generateTestcases(filePath)
{

	var content = "var ClimbingGrade = require('./"+ filePath +"');\n";
	for ( var funcName in functionConstraints )
	{
		var params = {};

		// initialize params
		for (var i =0; i < functionConstraints[funcName].params.length; i++ )
		{
			var paramName = functionConstraints[funcName].params[i];
			//params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
			params[paramName] = [];
		}

		//console.log( params );

		// update parameter values based on known constraints.
		var constraints = functionConstraints[funcName].constraints;
		
		if(!constraints || constraints.length == 0) continue;
	
		content += ""
	
		// plug-in values for parameters
		
		
		for( var c = 0; c < constraints.length; c++ )
		{
			var constraint = constraints[c];
			if(params[constraint.ident] == undefined) params[constraint.ident] = [];
			params[constraint.ident].push(constraint.value);
		}

		
		for(var i=0; i<params["language"].length; i++){
					
			content += "\nvar grade = new ClimbingGrade('{0}','{1}');\n".format(params["value"][i], params["language"][i]);
			
			for(var j=0; j<params["language"].length; j++){
				if(i != j){
					content += "grade.format('{0}');\n".format(params["language"][j]);
				}
			}
		}
		
	}

	fs.writeFileSync('test.js', content, "utf8");

}

function generateMockFsTestcases (pathExists, fileExists, fileWithContent, fileWithouxontent, funcName,args) 
{
	var testcase = "";
	// Build mock file system based on constraints.
	var mergedFS = {};
	if( pathExists )
	{
		for (var attrname in mockFileLibrary.pathExists) { mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; }
		if(fileExists)
		{
			mergedFS[attrname] = {"dir1":"testdir"};
		}
	}
	if( fileWithContent )
	{
		for (var attrname in mockFileLibrary.fileWithContent) { mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname]; }
		if(fileWithouxontent)
		{
			mergedFS[attrname] = {'file1':''};
		}
	}

	testcase += 
	"mock(" +
		JSON.stringify(mergedFS)
		+
	");\n";

	testcase += "\tClimbingGrade.{0}({1});\n".format(funcName, args );
	testcase+="mock.restore();\n";
	return testcase;
}

function constraints(filePath)
{
   var buf = fs.readFileSync(filePath, "utf8");
	var result = esprima.parse(buf, options);

	
		traverse(result, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var funcName = functionName(node);
			console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));

			var params = node.params.map(function(p) {return p.name});

			functionConstraints[funcName] = {constraints:[], params: params};

			// Check for expressions using argument.
			traverse(node, function(child)
			{
				if( child.type === 'ExpressionStatement' && child.expression.left.property.name == "_systems")
				{
					
					var testData = ["2", "2+", "3", "3+", "4", "4+", "5a", "5b", "5c", "6a", "6a+", "6b", "6b+", "6c", "6c+", "7a", "7a+", "7b", "7b+", "7c", "7c+", "8a", "8a+", "8b", "8b+", "8c", "8c+", "9a", "9a+", "9b", "9b+", "9c"];
					var yds = ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10a", "5.10b", "5.10c", "5.10d", "5.11a", "5.11b", "5.11c", "5.11d", "5.12a", "5.12b", "5.12c", "5.12d", "5.13a", "5.13b", "5.13c", "5.13d", "5.14a", "5.14b", "5.14c", "5.14d", "5.15a", "5.15b", "5.15c", "5.15d"];

					for(var i=0; i<testData.length;i++)
					{
					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: "language",
								value: "french",
								funcName: funcName,
								kind: "string",
								operator : "=",
								expression: ""
							}), 
							new Constraint(
							{
								ident: "value",
								value: testData[i],
								funcName: funcName,
								kind: "string",
								operator : "=",
								expression: ""
							})
							
						);
					functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: "language",
								value: "yds",
								funcName: funcName,
								kind: "string",
								operator : "=",
								expression: ""
							}), 
							new Constraint(
							{
								ident: "value",
								value: yds[i],
								funcName: funcName,
								kind: "string",
								operator : "=",
								expression: ""
							})
							
						);
					}
				}
				






				
			});

			console.log( functionConstraints[funcName]);

		}
	});
}

function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "";
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(maxh, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();
