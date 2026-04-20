/**
 * Class for storing the constraint queue in AC3 algorithm.
 */
export default class ACQueue {
    /**
     * Creates an empty queue.
     */
    constructor() {
        this.queue = []; // array for storing elements
        this.map = new Map(); // map for tracking presence of elements
    }

    /**
     * Add a new element to the queue if it is not present already.
     * @param constraintToCheck Element to be added (instance of Constraint).
     */
    push(constraintToCheck) {
        const keyInMap = constraintToCheck.getDisplayName();
        if (!this.map.has(keyInMap)) {
            this.map.set(keyInMap, true);
            this.queue.push(constraintToCheck);
        }
    }

    isEmpty(){
        return this.queue.length === 0;
    }

    /**
     * @returns {*} One element from the queue which is also removed.
     */
    pop() {
        const constraintToCheck = this.queue.shift();
        if (constraintToCheck) {
            this.map.delete(constraintToCheck.getDisplayName());
        }
        return constraintToCheck;
    }
}