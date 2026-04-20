/**
 * Represents a single constraint among the variables.
 * @class
 */
export default class Constraint {
    /**
     * Defines a constraint among two variables (possible words): if variable 1 is assigned word w1 and variable 2 is
     * assigned word w2, then we require w1[position1] === w2[position2].
     * @param position1 Zero-based index on the position in the first variable.
     * @param position2 Zero-based index on the position in the second variable.
     * @param variable1Id Index of the first variable.
     * @param variable2Id Index of the second variable.
     */
    constructor(position1, position2, variable1Id, variable2Id) {
        this.position1 = position1;
        this.position2 = position2;
        this.variable1Id = variable1Id;
        this.variable2Id = variable2Id;
    }

    getDisplayName(){
        return `${this.variable1Id}, ${this.variable2Id}, ${this.position1}, ${this.position2}`
    }
}