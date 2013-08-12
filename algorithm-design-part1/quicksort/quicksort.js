#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');

var SORT_IN_DEFAULT = "input.txt";
var SORT_OUT_DEFAULT = "output.txt";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

function readInput(input, callback) {
	var remaining = '';
	var dataArray = [];
	input.on('data', function(data) {
		remaining += data;
		var index = remaining.indexOf('\n');
		while (index > -1) {
			var line = remaining.substring(0, index);
			remaining = remaining.substring(index + 1);
			dataArray.push(parseInt(line.trim()));
			index = remaining.indexOf('\n');
		}
	});
	input.on('end', function(){callback(dataArray)});
}

var fnswap = function(a, b) {
	var tmp = this[a];
	this[a] = this[b];
	this[b] = tmp;
}

function quickSort(p, data, left, right) {

	console.log("\nleft: %d, right %d", left, right);	
	
	// return single element
	if (left >= right) {
		return data;
	}
	
	// divide and conquer
	// var pivot = Math.floor((f-s) / 2);
	var pivot = left + Math.floor(Math.random() * (right - left));

	console.log("random from [%d]: %d", data.length, pivot);
	console.log("pivotValue: %d, input: %s", data[pivot], data.join(", "));

	data.swap(s, pivot);
	var j = s;	
	for (i = 1; i < f; i++) {
		if (data[i] < data[s]) {
			data.swap(i, j + 1);
			j++;
		}
	}
	data.swap(j, s);
	console.log("pivot: %d, pivPos: %d, output: %s",data[j], j, data.join(", "));
	console.log("s: %d, j: %d, f: %d ", s, j, f);
	
	// quickSort(p + " -> d0", data, s, s + j - 1);
	// quickSort(p + " -> d1", data, j + 1, f);
	
	return data;

}

if (require.main == module) {
    
    // parse command line input into program variables
    program
	.option('-s, --sort <input>', 'Path to sort input file', clone(assertFileExists), SORT_IN_DEFAULT)
	.option('-o, --out <output>', 'Path to sort output file', clone(assertFileExists), SORT_OUT_DEFAULT)    
	.parse(process.argv);
	
	console.log("input file: %s", program.sort);
	console.log("output file: %s", program.out);

	// invoked once file content is read
	var callback = function(data) {
		console.log("Input data size: %s", data.length);		
		data.swap = fnswap;
		var sorted = quickSort("main", data, 0, data.length - 1);
		console.log("Sorted: %s", sorted.join(", "));
		// console.log("Inversions: %d", sorted.inversions)
		fs.writeFileSync(program.out, sorted);
	}
	
	var input = fs.createReadStream(program.sort);
	readInput(input, callback);
	
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
