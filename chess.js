// ChessGame.js

class ChessGame {
    constructor(game) {
      this.game = game;
      this.ctx = game.ctx;
      
      // Board configuration
      this.rows = 8;
      this.cols = 8;
      // We'll choose a square size that fits on screen; adjust as needed.
      this.squareSize = Math.min(this.ctx.canvas.width, this.ctx.canvas.height) / 10;
      this.boardX = (this.ctx.canvas.width - this.squareSize * this.cols) / 2;
      this.boardY = (this.ctx.canvas.height - this.squareSize * this.rows) / 2;
      
      // Initialize board: use a simplified layout (only kings and pawns)
      this.board = this.initializeBoard();
      
      // Selection state: current highlighted square (for moving pieces)
      this.selectedRow = 0;
      this.selectedCol = 0;
      // If a piece is selected for moving, store its position and piece object
      this.selectedPiece = null;
      this.moveMode = false; // false = no piece selected; true = piece selected
  
      // For handling key presses, we check the gameEngine's keys in update()
      this.lastKeys = {};
  
      // Game state flags
      this.isGameOver = false;
      this.hasWon = false;
    }
    
    initializeBoard() {
      // Create an 8x8 board, filled with null
      const board = [];
      for (let r = 0; r < this.rows; r++) {
        board[r] = new Array(this.cols).fill(null);
      }
      // Place black king at row 0, column 4; black pawns at row 1
      board[0][4] = { type: "K", color: "black" };
      for (let c = 0; c < this.cols; c++) {
        board[1][c] = { type: "P", color: "black" };
      }
      // Place white king at row 7, column 4; white pawns at row 6
      board[7][4] = { type: "K", color: "white" };
      for (let c = 0; c < this.cols; c++) {
        board[6][c] = { type: "P", color: "white" };
      }
      return board;
    }
    
    update() {
      // Read the key states from the game engine's keys (assumed to be booleans)
      const keys = this.game.keys;
      
      // Move selection with arrow keys (simulate discrete key presses)
      if (keys["ArrowUp"] && !this.lastKeys["ArrowUp"]) {
        this.selectedRow = Math.max(0, this.selectedRow - 1);
      }
      if (keys["ArrowDown"] && !this.lastKeys["ArrowDown"]) {
        this.selectedRow = Math.min(this.rows - 1, this.selectedRow + 1);
      }
      if (keys["ArrowLeft"] && !this.lastKeys["ArrowLeft"]) {
        this.selectedCol = Math.max(0, this.selectedCol - 1);
      }
      if (keys["ArrowRight"] && !this.lastKeys["ArrowRight"]) {
        this.selectedCol = Math.min(this.cols - 1, this.selectedCol + 1);
      }
      
      // On Enter key: if not in move mode, select a piece; if already selected, move it.
      if (keys["Enter"] && !this.lastKeys["Enter"]) {
        if (!this.moveMode) {
          // If a piece exists at the selected square, select it.
          if (this.board[this.selectedRow][this.selectedCol]) {
            this.selectedPiece = {
              piece: this.board[this.selectedRow][this.selectedCol],
              row: this.selectedRow,
              col: this.selectedCol
            };
            this.moveMode = true;
          }
        } else {
          // Attempt to move the selected piece to the new square if empty.
          const destRow = this.selectedRow;
          const destCol = this.selectedCol;
          if (this.selectedPiece && (destRow !== this.selectedPiece.row || destCol !== this.selectedPiece.col)) {
            // For simplicity, only allow move if destination is empty.
            if (!this.board[destRow][destCol]) {
              this.board[destRow][destCol] = this.selectedPiece.piece;
              this.board[this.selectedPiece.row][this.selectedPiece.col] = null;
            }
          }
          // Clear selection regardless of move success.
          this.selectedPiece = null;
          this.moveMode = false;
        }
      }
      
      // Save current keys for next update cycle
      this.lastKeys = { ...keys };
    }
    
    draw(ctx) {
      // Draw the chess board: iterate over rows and columns.
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const x = this.boardX + c * this.squareSize;
          const y = this.boardY + r * this.squareSize;
          // Alternate colors for squares.
          if ((r + c) % 2 === 0) {
            ctx.fillStyle = "#f0d9b5";
          } else {
            ctx.fillStyle = "#b58863";
          }
          ctx.fillRect(x, y, this.squareSize, this.squareSize);
          
          // Draw the piece if present.
          const piece = this.board[r][c];
          if (piece) {
            ctx.fillStyle = piece.color === "white" ? "white" : "black";
            ctx.font = `${this.squareSize * 0.8}px sans-serif`;
            let symbol = "";
            if (piece.type === "K") {
              symbol = piece.color === "white" ? "\u2654" : "\u265A";
            } else if (piece.type === "P") {
              symbol = piece.color === "white" ? "\u2659" : "\u265F";
            }
            ctx.fillText(symbol, x + this.squareSize * 0.1, y + this.squareSize * 0.9);
          }
        }
      }
      
      // Draw a red border around the selected square
      const selX = this.boardX + this.selectedCol * this.squareSize;
      const selY = this.boardY + this.selectedRow * this.squareSize;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.strokeRect(selX, selY, this.squareSize, this.squareSize);
    }
  }
  
  export { ChessGame as ChessGame };  