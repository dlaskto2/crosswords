const Variable = require("./Variable.js").default;
const Constraint = require("./Constraint.js").default;
const ACQueue = require("./ACQueue.js").default;

/**
 * Depth-first search for a solution to the crossword.
 * @param variables List of the variables corresponding to the current node in the search tree.
 * @param constraintsPerVariable The map with the constraints.
 * @param applyAC Whether to apply arc consistency domain pruning in each node of the search tree.
 * @returns {*|null} A list of variables corresponding to a solution, if solution is found. Otherwise, returns null.
 */
function search(variables, constraintsPerVariable, applyAC) {
    // apply arc consistency if required
    if (applyAC) {
        variables = AC3(variables, constraintsPerVariable);
        if (variables === null) {
            return null;
        }
    }

    // find an unassigned variable with smallest domain - fail first heuristic
    let smallestDomainSize = Infinity;
    let variableId = -1;
    for (const variable of variables){
        if (variable.domain.length < smallestDomainSize && !variable.assigned) {
            smallestDomainSize = variable.domain.length;
            variableId = variable.index;
        }
    }
    if (smallestDomainSize === 0) {
        return null; // some domain is empty, no solution from here
    } else if (variableId === -1) {
        return variables; // all variables assigned, solution
    } else {
        // try each element of the variable's domain until a solution or contradiction is found
        for (const word of variables[variableId].domain){
            let variablesCopy = structuredClone(variables); // deep copy of the variables so that we could change the domains etc.

            // assign the word
            variablesCopy[variableId].domain = [word];
            variablesCopy[variableId].assigned = true;

            // reduce the other domains to enforce uniqueness of the words in the solution
            for (const otherVariable of variablesCopy) {
                if (otherVariable.index !== variableId && otherVariable.length === variablesCopy[variableId].length){
                    otherVariable.domain = otherVariable.domain.filter(item => item !== word);
                }
            }
            // reduce the other domains - keep only words that are consistent with the current assignment
            for (const constraint of constraintsPerVariable.get(variableId)) {
                variablesCopy[constraint.variable2Id].domain =
                    variablesCopy[constraint.variable2Id].domain.filter(word2 =>
                        word2[constraint.position2] === word[constraint.position1]);
            }
            // recurse with one more word assigned
            let result = search(variablesCopy, constraintsPerVariable, applyAC);
            if (result!==null) {
                return result; // solution found
            } else {
                variablesCopy = null; // no solution found, set to null to trigger GC
            }
        }
        return null;
    }
}

/**
 * AC3 algorithm that enforces arc consistency of the domains.
 * @param variables List of variables whose domains are to be reduced.
 * @param constraintsPerVariable Map with constraints.
 * @returns {*|null} List of variables with reduced (or the same) domains or null if some domain was erased completely.
 */
function AC3(variables, constraintsPerVariable) {
    // initialize set of directed constraints to contain all
    let toCheck = new ACQueue();
    for (const [variable1, constraints] of constraintsPerVariable){
        for (const constraint of constraints) {
            toCheck.push(new Constraint(constraint.position1, constraint.position2, variable1, constraint.variable2Id));
        }
    }
    while (!toCheck.isEmpty()) {
        let constraintToCheck = toCheck.pop();
        // find which domain elements to remove
        let domainElementsToRemove = [];
        for (const elemV1 of variables[constraintToCheck.variable1Id].domain){
            // find support of element (i.e., compatible word)
            let supportFound = false;
            for (const elemV2 of variables[constraintToCheck.variable2Id].domain){
                if (elemV1[constraintToCheck.position1] === elemV2[constraintToCheck.position2]){
                    supportFound = true;
                    break;
                }
            }
            if (!supportFound){
                domainElementsToRemove.push(elemV1);
            }
        }
        if (domainElementsToRemove.length > 0) {
            // remove elements from domain
            variables[constraintToCheck.variable1Id].domain =
                variables[constraintToCheck.variable1Id].domain.filter(item => !domainElementsToRemove.includes(item));
            if (variables[constraintToCheck.variable1Id].domain.length === 0){
                // empty domain
                return null;
            } else {
                // fill queue in the other direction to check whether some support was removed
                for (const constraint of constraintsPerVariable.get(constraintToCheck.variable1Id)) {
                    if (constraint.variable2Id !== constraintToCheck.variable2Id){
                        toCheck.push(new Constraint(constraint.position2, constraint.position1, constraint.variable2Id,
                            constraintToCheck.variable1Id, ))
                    }
                }
            }
        }

    }
    return variables;
}

/**
 * Initializes constraints based on structure of variables. This is done by creating a list of crossing points of the
 * words - i.e., for each word, list the words that it crosses to enure consistency of the letters at the same
 * positions.
 * @param variables List of variables.
 * @returns {Map<any, any>} containing, for each variable index, the list of constraints that regard it.
 */
function initializeConstraints(variables){
    // initialize map as empty
    let constraintsPerVariable = new Map();
    for (let i = 0; i < variables.length; i++) {
        constraintsPerVariable.set(i,[]);
    }
    // divide variables into 2 categories - across and down
    let variablesAcross = variables.filter(variable => variable.across);
    let variablesDown = variables.filter(variable => !variable.across);
    // find the crossing points
    for (let vAcross of variablesAcross){
        for (let vDown of variablesDown){
            // check whether the words cross
            if (vAcross.column <= vDown.column && vDown.column <= vAcross.column+vAcross.length-1 &&
                vDown.row <= vAcross.row && vAcross.row <= vDown.row + vDown.length-1){
                let positionInAcross = vDown.column-vAcross.column;
                let positionInDown = vAcross.row-vDown.row;
                // the positionInAcross-th letter of vAcross should be equal to positionInDown-th letter of vDown
                constraintsPerVariable.get(vAcross.index).push(
                    new Constraint(positionInAcross, positionInDown, vAcross.index, vDown.index));
                constraintsPerVariable.get(vDown.index).push(
                    new Constraint(positionInDown, positionInAcross, vDown.index, vAcross.index));
            }
        }
    }
    return constraintsPerVariable;
}

/**
 * Initializes the structure of variables based on the pattern of the input table.
 * @param table Input table.
 * @param wordsOfLength Maps an integer to a list of all words of such length in the dictionary.
 * @returns {*[]} Structure of the variables (words to be filled in).
 */
function initializeVariables(table, wordsOfLength){
    let width = table[0].length;
    let height = table.length;

    let variables = [];

    // scan through the table to identify places where the words start
    for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
            if (table[row][column] === "-"){
                // across condition - for horizontal words
                if ((column === 0 || table[row][column-1] === "*") && column !== width-1 && table[row][column+1] === "-"){
                    // compute length of word
                    let length = 1;
                    while (column+length !== width && table[row][column+length] === "-"){
                        length++;
                    }
                    variables.push(new Variable(variables.length, row, column, length, false, wordsOfLength.get(length), true))
                }
                // down conditions - for vertical words
                if ((row === 0 || table[row-1][column] === "*") && row!==height-1 && table[row+1][column] === "-"){
                    // compute length of word
                    let length = 1;
                    while (row+length !== height && table[row + length][column] === "-"){
                        length++;
                    }
                    variables.push(new Variable(variables.length, row, column, length, false, wordsOfLength.get(length), false))
                }
            }

        }

    }
    return variables;
}

module.exports = { initializeVariables, initializeConstraints, search };