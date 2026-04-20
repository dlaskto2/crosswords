const fs = require('fs');

/**
 * Reads lines from a textfile
 * @param pathToFile Path to the file.
 * @returns {string[]} List of strings corresponding to rows of the file.
 */
function readLines(pathToFile) {
    try {
        const content = fs.readFileSync(pathToFile, 'utf8');
        return content.split("\n");
    } catch (err) {
        console.error("Unable to read file:", err.message);
    }
}

/**
 * Reads a dictionary of allowed words from a text file.
 * @param pathToFile Path to the file with the dictionary.
 * @param minLength Minimum allowed length of word (inclusive).
 * @param maxLength Maximum allowed length of word (inclusive).
 * @returns {Map<any, any>} containing, for each considered length of the word, the list of allowed words. Words of
 * length outside the specified interval are filtered.
 */
function readDictionary(pathToFile, minLength, maxLength) {
    let wordsOfLength = new Map();
    for (let i = minLength; i <= maxLength; i++) {
        wordsOfLength.set(i,[]);
    }
    let words = readLines(pathToFile);
    for (let word of words) {
        if (minLength <= word.length && word.length <= maxLength){
                wordsOfLength.get(word.length).push(word);
        }
    }
    return wordsOfLength;
}

/**
 * Outputs resulting filled-in table into the console.
 * @param variables Array of variables (assigned, with singleton domains).
 * @param inputTable Input table that defines the structure of the crossword.
 */
function outputResult(variables, inputTable) {
    // fill the table with the words
    for (let variable of variables) {
        for (let i = 0; i < variable.length; i++) {
            let row = variable.row + (variable.across ? 0 : i);
            let column = variable.column + (variable.across ? i : 0);
            let line = inputTable[row];
            inputTable[row] = line.substring(0,column) + variable.domain[0][i] + line.substring(column+1);
        }
    }
    // output
    for (let row = 0; row < inputTable.length; row++) {
        console.log(inputTable[row])
    }
}

module.exports = { outputResult, readLines, readDictionary };