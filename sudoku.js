"use strict";

var EASY_PUZZLE = "1-58-2----9--764-52--4--819-19--73-6762-83-9-----61-5---76---3-43--2-5-16--3-89--";
var MEDIUM_PUZZLE = "-3-5--8-45-42---1---8--9---79-8-61-3-----54---5------78-----7-2---7-46--61-3--5--";
var HARD_PUZZLE = "8----------36------7--9-2---5---7-------457-----1---3---1----68--85---1--9----4--";

// Set this variable to true to publicly expose otherwise private functions inside of SudokuSolver
var TESTABLE = true;

var SudokuSolver = function (testable) {
  var solver;

  // PUBLIC FUNCTIONS

  // Takes a string representation of a Sudoku board, checks if the board is valid, and attempts to solve the Sudoku puzzle using a recursive solving algorithm. It returns the solution if it exists, or false if the board is invalid or unsolvable.
  function solve(boardString) {
    var boardArray = boardString.split("");
    if (boardIsInvalid(boardArray)) {
      return false;
    }
    return recursiveSolve(boardString);
  }

  // Takes a string representation of a Sudoku board, attempts to solve the puzzle, converts the solved board into a string, prints it to the console, and returns the solved board.
  function solveAndPrint(boardString) {
    var solvedBoard = solve(boardString);
    console.log(toString(solvedBoard.split("")));
    return solvedBoard;
  }

  // PRIVATE FUNCTIONS

  //The function will continue recursively exploring possible choices until a valid solution is found or all possibilities have been exhausted. Exploring different choices and undoing them if they lead to invalid solutions.
  function recursiveSolve(boardString) {
    var boardArray = boardString.split("");
    if (boardIsSolved(boardArray)) {
      //if board is already solved, returns the solved board as a string by joining the characters 
      return boardArray.join("");
    }
    // find the next empty cell in the Sudoku board (boardArray) and obtain the possible numbers (choices) that can be placed in that cell. The result is stored in the cellPossibilities variable.
    var cellPossibilities = getNextCellAndPossibilities(boardArray);

    // extracts the index of the next empty cell from the cellPossibilities object.
    var nextUnsolvedCellIndex = cellPossibilities.index;

    // extracts the array of possible numbers (choices) that can be placed in the next empty cell from the cellPossibilities object.
    var possibilities = cellPossibilities.choices;


    for (var i = 0; i < possibilities.length; i++) {
      boardArray[nextUnsolvedCellIndex] = possibilities[i];//sets the value of the next empty cell in boardArray to each possibility one by one.
      var solvedBoard = recursiveSolve(boardArray.join(""));//This recursive call is essential for trying different choices and backtracking if the current choice leads to an invalid solution.
      if (solvedBoard) {
        return solvedBoard;
      }
    }
    return false;
  }

  //checks if the board is invalid
  function boardIsInvalid(boardArray) {
    return !boardIsValid(boardArray);
  }

  //Validate the rows, columns, and boxes of the board, and returns true if all three validations pass, or false if any of them fail.
  function boardIsValid(boardArray) {
    return allRowsValid(boardArray) && allColumnsValid(boardArray) && allBoxesValid(boardArray);
  }

  // Iterates through each element of the array and returns false if it finds any empty or unresolved cell represented by "-", and true if all cells are filled with valid numbers.
  function boardIsSolved(boardArray) {
    for (var i = 0; i < boardArray.length; i++) {
      if (boardArray[i] === "-") {
        return false;
      }
    }
    return true;
  }

  // Determines the next cell that needs to be filled in the puzzle and the possible values that can be placed in that cell. The algorithm proceeds by trying different choices in the empty cells until a valid solution is found.
  function getNextCellAndPossibilities(boardArray) {
    for (var i = 0; i < boardArray.length; i++) {
      if (boardArray[i] === "-") {
        var existingValues = getAllIntersections(boardArray, i);//fetches the values present in the same row, column, and 3x3 box as the empty cell.

        // uses the filter method to exclude the numbers that already exist in the existingValues array. The filter callback function ensures that only the numbers not present in existingValues are retained in the choices array.
        var choices = ["1", "2", "3", "4", "5", "6", "7", "8", "9"].filter(function (num) {
          return existingValues.indexOf(num) < 0;
        });
        //The function then returns an object containing the index of the next empty cell (i) and the array of choices, representing the possible numbers that can be placed in that cell.
        return { index: i, choices: choices };
      }
    }
  }

  // it returns all the elements that share the same row, column, and 3x3 box as the specified index.
  function getAllIntersections(boardArray, i) {
    return getRow(boardArray, i).concat(getColumn(boardArray, i)).concat(getBox(boardArray, i));
  }

  function allRowsValid(boardArray) {
    //iterate over the array of starting indices and extracts each row using the getRow function. 
    return [0, 9, 18, 27, 36, 45, 54, 63, 72].map(function (i) {
      return getRow(boardArray, i);
      //The reduce function is used to check the validity of each row. It iterates over the array of rows and starts with an initial value of true. For each row, it checks the validity using the collectionIsValid function.
    }).reduce(function (validity, row) {
      return collectionIsValid(row) && validity;
    }, true);
  }

  // It extracts and returns the elements of the specified row from the Sudoku board as a new array.
  function getRow(boardArray, i) {
    //determines the starting element of the row based on the row index i. 
    var startingEl = Math.floor(i / 9) * 9;
    // returns a new array containing the elements starting from the startingEl index up to startingEl + 9
    return boardArray.slice(startingEl, startingEl + 9);
  }

  function allColumnsValid(boardArray) {
    //uses the map function to iterate over the array of column indices and extracts each column using the getColumn function.
    return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) {
      return getColumn(boardArray, i);
      //The reduce function is used to check the validity of each column. It iterates over the array of columns and starts with an initial value of true. For each column, it checks the validity using the collectionIsValid function.
    }).reduce(function (validity, row) {
      return collectionIsValid(row) && validity;
    }, true);
  }

  //This function allows you to extract any column from the Sudoku board array
  function getColumn(boardArray, i) {
    var startingEl = Math.floor(i % 9);//This startingEl represents the index of the first element of the desired column
    return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (num) {
      return boardArray[startingEl + num * 9];//calculates the index of the element in boardArray that corresponds to the desired column. 
    });
  }

  //this function returns true if all 3x3 boxes in the Sudoku board are valid (i.e., containing unique numbers from 1 to 9) and false otherwise. 
  function allBoxesValid(boardArray) {
    //starting indices of each 3x3 box in the Sudoku board. Extracts each 3x3 box using the getBox function.
    return [0, 3, 6, 27, 30, 33, 54, 57, 60].map(function (i) {
      return getBox(boardArray, i);
      //The reduce function is used to check the validity of each 3x3 box. It iterates over the array of boxes and starts with an initial value of true. For each box, it checks the validity using the collectionIsValid function.
    }).reduce(function (validity, row) {
      return collectionIsValid(row) && validity;
    }, true);
  }

  //This function allows you to extract any 3x3 box from the Sudoku board array
  function getBox(boardArray, i) {
    var boxCol = Math.floor(i / 3) % 3; //calculates the row index of the top-left cell of the desired box. 
    var boxRow = Math.floor(i / 27);//calculates the grid row index (0 to 2) of the 3x3 box within the Sudoku board
    var startingIndex = boxCol * 3 + boxRow * 27;//calculates the index of the top-left cell of the 3x3 box within the 1-dimensional boardArray
    return [0, 1, 2, 9, 10, 11, 18, 19, 20].map(function (num) {
      return boardArray[startingIndex + num];//calculates the index of the element in boardArray that corresponds to the desired 3x3 box.
    });
  }

  //this function is useful for checking if a row, column, or 3x3 box in a Sudoku board contains unique numbers from 1 to 9 (excluding empty cells represented by "-").
  function collectionIsValid(collection) {
    var numCounts = {};//used to keep track of the count of each number encountered in the collection.
    for(var i = 0; i < collection.length; i++) {
      if (collection[i] != "-") {
        if (numCounts[collection[i]] === undefined) {
          numCounts[collection[i]] = 1;
        } else {
          return false;
        }
      }
    }
    return true;
  }

  //converting a 1-dimensional array representation of a Sudoku board into a formatted string
  function toString(boardArray) {
    return [0, 9, 18, 27, 36, 45, 54, 63, 72].map(function (i) {
      return getRow(boardArray, i).join(" ");
    }).join("\n");// After mapping each row to a string, this join method is used to concatenate all the rows together, separated by a newline character ("\n"). This creates a formatted string representation of the entire Sudoku board.
  }

  if (testable) {
    // These methods will be exposed publicly when testing is on.
    solver = { 
      solve: solve,
      solveAndPrint: solveAndPrint,
      recursiveSolve: recursiveSolve,
      boardIsInvalid: boardIsInvalid,
      boardIsValid: boardIsValid,
      boardIsSolved: boardIsSolved,
      getNextCellAndPossibilities: getNextCellAndPossibilities,
      getAllIntersections: getAllIntersections,
      allRowsValid: allRowsValid,
      getRow: getRow,
      allColumnsValid: allColumnsValid,
      getColumn: getColumn,
      allBoxesValid: allBoxesValid,
      getBox: getBox,
      collectionIsValid: collectionIsValid,
      toString: toString };
  } else {
    // These will be the only public methods when testing is off.
    solver = { solve: solve,
      solveAndPrint: solveAndPrint };
  }

  return solver;
}(TESTABLE);