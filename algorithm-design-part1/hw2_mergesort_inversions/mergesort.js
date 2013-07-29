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

function mergeSort (p, data) {
	// return single element
	if (data.length == 1) {
		return data;
	}
	
	// swap if needed and return
	if (data.length == 2) {
		if (data[0] > data[1]) {
			var rez = new Array(data[1], data[0]);
			rez.inversions = 1;
			return rez;
		}
		return data;
	}
	
	// divide and conquer
	piv = Math.floor(data.length / 2);
	var d0 = data.slice(0, piv);
	var d1 = data.slice(piv, data.length);
	d0.inversions = 0;
	d1.inversions = 0;
	
	var rez0 = mergeSort(p + " -> d0", d0);
	var rez1 = mergeSort(p + " -> d1", d1);
	k0 = 0;
	k1 = 0;
	var rez = new Array();
	rez.inversions = rez0.inversions + rez1.inversions;

	// merge
	for (i = 0; i < data.length; i++) {
		
		// rez0 exhausted, copy all rez1
		if (k0 == rez0.length && k1 < rez1.length) {
			var tail = rez1.slice(k1, rez1.length);
			// preserve inversions attribute
			inv = rez.inversions;
			rez = rez.concat(tail);
			rez.inversions = inv;
			break;
		}

		// rez1 exhausted, copy all rez0
		if (k1 == rez1.length && k0 < rez0.length) {
			var tail = rez0.slice(k0, rez0.length);
			// preserve inversions attribute			
			inv = rez.inversions;
			rez = rez.concat(tail);
			rez.inversions = inv;
			break;
		}
		
		if (rez0[k0] > rez1[k1]) {			
			rez.push(rez1[k1]);
			rez.inversions += (rez0.length - k0);
			k1++;			
		} else {
			rez.push(rez0[k0]);
			k0++;		
		}
		
	}
	return rez;
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
		var sorted = mergeSort("main", data);
		// console.log("Sorted: %s", sorted.join(", "));
		console.log("Inversions: %d", sorted.inversions)
		fs.writeFileSync(program.out, sorted);
	}
	
	var input = fs.createReadStream(program.sort);
	readInput(input, callback);
	
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
