/**
 * Represents a field for a single word in the crossword, which is interpreted as a variable in a CSP.
 * @class
 */
export default class Variable {
    /**
     *
     * @param index Unique index of the variable.
     * @param row Row index of the cell where the corresponding word starts (in zero-based indexing).
     * @param column Column index of the cell where the corresponding word starts (in zero-based indexing).
     * @param length Length of the word.
     * @param assigned Whether the variable is already assigned a single value (word).
     * @param domain Possible remaining values (words) for the variable. A singleton array if assigned.
     * @param across A boolean value representing whether the word is horizontally (across) or vertically (down) placed.
     */
    constructor(index, row, column, length, assigned, domain, across){
        this.index = index;
        this.row = row;
        this.column = column;
        this.length = length;
        this.assigned = assigned;
        this.domain = domain;
        this.across = across;
    }

    getDisplayName() {
        return `Variable(${self.row},${self.column}), id: ${self.index}, length: ${self.length}, assigned: ${self.assigned}, domain size:${self.domain.length} across: ${self.across}`;
    }
}