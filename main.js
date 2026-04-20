const MIN_LENGTH = 2; // minimum expected length of word (note: if words of length 1 are to be allowed, function initializeVariables needs to be adjusted)
const MAX_LENGTH = 7; // maximum expected length of word
const PATH_TO_DICTIONARY = "C:\\Users\\TD\\Downloads\\collins.txt"; // path to the dictionary of allowed words
const PATH_TO_INPUT = "C:\\Users\\TD\\Downloads\\input2.txt";  // path to the array pattern
const APPLY_AC = false; // whether to apply arc consistency domain filtering in each node of search tree

const { initializeVariables, initializeConstraints, search } = require('./logic.js');
const { outputResult, readLines, readDictionary } = require('./io.js');

const _ = require("underscore");

let wordsOfLength = readDictionary(PATH_TO_DICTIONARY, MIN_LENGTH, MAX_LENGTH); // load words and group by length
let table = readLines(PATH_TO_INPUT) // get input array
let variables = initializeVariables(table, wordsOfLength) // create variables based on the words and structure of input

// shuffle the domains to ensure randomness of result
for (let variable of variables) {
    variable.domain = _.shuffle(variable.domain);
}
let constraintsPerVariable = initializeConstraints(variables); // create constraints based on the intersections of the words
// constraintsPerVariable is a map that, for each variable index id, stores the list of constraints that regard that variable

let result = search(variables, constraintsPerVariable, APPLY_AC) // search for the solution of the CSP
if (result === null) {
    console.log("No solution exists.")
} else {
    outputResult(result, table); // output the solution to console
}
