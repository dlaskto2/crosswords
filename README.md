## About this repository

This repository contains an implementation of a solver in Javascript / Node.js for the following task: 

Given a rectangular array of white and black cells defining a crossword pattern, find words from a dictionary to create the crossword.

### Using the code

Assuming that you have Node.js installed, it is necessary to run 
```sh
npm install underscore
```


Then, in the `main.js` file, please:
* Set the constant `PATH_TO_DICTIONARY` to the path to the dictionary (e.g., "Users/Me/collins.txt"). Note that the words in the dictionary should be on individual lines and either all in upper case or all in lower case.
* Set the constant `PATH_TO_INPUT` to the path leading to a text file with the crossword pattern. This should be a rectangular array of marks `-`, corresponding to white spaces, and `*`, corresponding to black spaces. Example of the input:
```sh
-----
----*
-*--*
--*--
-----
-*-*-
```

Finally, one can run the code by
```sh
node main.js
```

If a solution exists, the script outputs a random solution to the console, e.g.:
```sh
ABRAY
VAUS*
E*CH*
NO*ER
UKASE
E*I*O
```

### Additional notes
By default, the arc consistency domain filtering technique is switched off as it results in a large overhead in simpler cases. However, if you try to run the method on a more complex or larger task, it may speed up the search for a solution. Arc consistency pruning can be enabled by setting the constant `APPLY_AC` in `main.js` to `true`.