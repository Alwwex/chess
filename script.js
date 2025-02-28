    // Game state
    const state = {
      selectedPiece: null,
      message: "Choose a chess piece to learn how it moves!",
      highlightedSquares: [],
      captureSquares: [],
      selectedCell: null,
      gameMode: 'learn', // 'learn' or 'challenge'
      targetCell: null,
      challengeLevel: 1,
      successCount: 0,
      showConfetti: false
    };

    // Chess pieces
    const pieces = [
      { name: 'Pawn', image: '♟️', description: 'Pawns move forward one square, but capture diagonally!' },
      { name: 'Rook', image: '♜', description: 'Rooks move in straight lines - up, down, left, or right!' },
      { name: 'Knight', image: '♞', description: 'Knights move in an L-shape and can jump over other pieces!' },
      { name: 'Bishop', image: '♝', description: 'Bishops move diagonally across the board!' },
      { name: 'Queen', image: '♛', description: 'Queens are powerful! They move in any direction - straight or diagonal!' },
      { name: 'King', image: '♚', description: 'Kings can move one square in any direction. Protect your king!' }
    ];

    // DOM elements
    const messageElement = document.getElementById('message');
    const pieceSelectionElement = document.getElementById('pieceSelection');
    const learnModeButton = document.getElementById('learnMode');
    const challengeModeButton = document.getElementById('challengeMode');
    const levelDisplayElement = document.getElementById('levelDisplay');
    const levelTextElement = document.getElementById('levelText');
    const progressFillElement = document.getElementById('progressFill');
    const pawnLegendElement = document.getElementById('pawnLegend');
    const chessboardElement = document.getElementById('chessboard');
    const gameInstructionsElement = document.getElementById('gameInstructions');

    // Initialize piece selection
    function initPieceSelection() {
      pieces.forEach(piece => {
        const pieceButton = document.createElement('button');
        pieceButton.className = 'piece-button';
        pieceButton.innerHTML = `
          <span class="piece-image">${piece.image}</span>
          <span class="piece-name">${piece.name}</span>
        `;
        pieceButton.addEventListener('click', () => handlePieceSelect(piece));
        pieceSelectionElement.appendChild(pieceButton);
      });
    }

    // Initialize chessboard
    function initChessboard() {
      chessboardElement.innerHTML = '';
      for (let row = 0; row < 8; row++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'board-row';
        
        for (let col = 0; col < 8; col++) {
          const cellElement = document.createElement('div');
          const isWhite = (row + col) % 2 === 0;
          cellElement.className = `cell ${isWhite ? 'white' : 'black'}`;
          cellElement.dataset.row = row;
          cellElement.dataset.col = col;
          cellElement.addEventListener('click', () => handleCellClick(row, col));
          rowElement.appendChild(cellElement);
        }
        
        chessboardElement.appendChild(rowElement);
      }
    }

    // Handle piece selection
    function handlePieceSelect(piece) {
      state.selectedPiece = piece;
      state.message = `Great choice! This is the ${piece.name}. ${piece.description}`;
      state.highlightedSquares = [];
      state.captureSquares = [];
      state.selectedCell = null;
      state.targetCell = null;
      state.gameMode = 'learn';
      
      updateUI();
    }

    // Handle cell click
    function handleCellClick(row, col) {
      if (!state.selectedPiece) return;
      
      if (state.gameMode === 'learn') {
        // Clear previous highlights
        state.highlightedSquares = [];
        state.captureSquares = [];
        
        // Set the selected cell
        state.selectedCell = [row, col];
        
        // Show valid moves based on the selected piece
        const { normalMoves, captureMoves } = getValidMoves(state.selectedPiece.name, row, col);
        state.highlightedSquares = normalMoves;
        state.captureSquares = captureMoves;
        
        state.message = `See how the ${state.selectedPiece.name} can move from this position!`;
      } else if (state.gameMode === 'challenge') {
        // Player is attempting to place their piece to capture the target
        if (state.selectedCell && row === state.selectedCell[0] && col === state.selectedCell[1]) {
          return; // Clicked on the same cell, do nothing
        }
        
        // Check if the move is valid
        const { normalMoves, captureMoves } = getValidMoves(state.selectedPiece.name, state.selectedCell[0], state.selectedCell[1]);
        const allValidMoves = [...normalMoves, ...captureMoves];
        const isValidMove = allValidMoves.some(([r, c]) => r === row && c === col);
        
        // Check if the target was hit
        const hitTarget = state.targetCell && row === state.targetCell[0] && col === state.targetCell[1];
        
        if (isValidMove && hitTarget) {
          // Success! Target captured
          showConfetti();
          
          state.message = `Excellent job! You captured the king with your ${state.selectedPiece.name}!`;
          state.successCount++;
          
          // After a brief delay, set up next challenge
          setTimeout(() => {
            if (state.successCount >= 3) {
              // Level up after 3 successes
              state.challengeLevel++;
              state.successCount = 0;
              state.message = `Level up! Now you're on level ${state.challengeLevel}!`;
            }
            startNewChallenge();
          }, 1500);
        } else if (isValidMove) {
          state.message = "That's a valid move, but you missed the king. Try again!";
          state.selectedCell = [row, col];
          const { normalMoves, captureMoves } = getValidMoves(state.selectedPiece.name, row, col);
          state.highlightedSquares = state.challengeLevel === 1 ? normalMoves : [];
          state.captureSquares = state.challengeLevel === 1 ? captureMoves : [];
        } else {
          state.message = `Oops! The ${state.selectedPiece.name} can't move like that. Try again!`;
        }
      }
      
      updateUI();
    }

    // Get valid moves based on piece type and position
    function getValidMoves(pieceName, row, col) {
      const normalMoves = [];
      const captureMoves = [];
      
      switch(pieceName) {
        case 'Pawn':
          // Forward movement (simplified for children)
          if (row > 0) normalMoves.push([row-1, col]);
          // Capture diagonally
          if (row > 0 && col > 0) captureMoves.push([row-1, col-1]);
          if (row > 0 && col < 7) captureMoves.push([row-1, col+1]);
          break;
        
        case 'Rook':
          // Horizontal and vertical movement
          for (let i = 0; i < 8; i++) {
            if (i !== row) normalMoves.push([i, col]);
            if (i !== col) normalMoves.push([row, i]);
          }
          break;
        
        case 'Knight':
          // L-shaped movement
          const knightMoves = [
            [row-2, col-1], [row-2, col+1],
            [row-1, col-2], [row-1, col+2],
            [row+1, col-2], [row+1, col+2],
            [row+2, col-1], [row+2, col+1]
          ];
          
          knightMoves.forEach(([r, c]) => {
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
              normalMoves.push([r, c]);
            }
          });
          break;
        
        case 'Bishop':
          // Diagonal movement
          for (let i = 1; i < 8; i++) {
            if (row+i < 8 && col+i < 8) normalMoves.push([row+i, col+i]);
            if (row+i < 8 && col-i >= 0) normalMoves.push([row+i, col-i]);
            if (row-i >= 0 && col+i < 8) normalMoves.push([row-i, col+i]);
            if (row-i >= 0 && col-i >= 0) normalMoves.push([row-i, col-i]);
          }
          break;
        
        case 'Queen':
          // Combine Rook and Bishop movements
          // Horizontal and vertical
          for (let i = 0; i < 8; i++) {
            if (i !== row) normalMoves.push([i, col]);
            if (i !== col) normalMoves.push([row, i]);
          }
          // Diagonal
          for (let i = 1; i < 8; i++) {
            if (row+i < 8 && col+i < 8) normalMoves.push([row+i, col+i]);
            if (row+i < 8 && col-i >= 0) normalMoves.push([row+i, col-i]);
            if (row-i >= 0 && col+i < 8) normalMoves.push([row-i, col+i]);
            if (row-i >= 0 && col-i >= 0) normalMoves.push([row-i, col-i]);
          }
          break;
        
        case 'King':
          // One square in any direction
          for (let r = Math.max(0, row-1); r <= Math.min(7, row+1); r++) {
            for (let c = Math.max(0, col-1); c <= Math.min(7, col+1); c++) {
              if (r !== row || c !== col) {
                normalMoves.push([r, c]);
              }
            }
          }
          break;
      }
      
      return { normalMoves, captureMoves };
    }

    // Start challenge mode
    function startChallenge() {
      if (!state.selectedPiece) {
        state.message = "First, select a chess piece for the challenge!";
        updateUI();
        return;
      }
      
      state.gameMode = 'challenge';
      startNewChallenge();
    }

    // Start a new challenge
    function startNewChallenge() {
      // Place the piece at a random position
      const startRow = Math.floor(Math.random() * 8);
      const startCol = Math.floor(Math.random() * 8);
      state.selectedCell = [startRow, startCol];
      
      // Get valid moves from this position
      const { normalMoves, captureMoves } = getValidMoves(state.selectedPiece.name, startRow, startCol);
      const allMoves = [...normalMoves, ...captureMoves];
      
      if (allMoves.length === 0) {
        // If no valid moves, try again
        startNewChallenge();
        return;
      }
      
      // Increase difficulty with level
      let targetIndex;
      if (state.challengeLevel === 1) {
        // Level 1: Target is a random valid move
        targetIndex = Math.floor(Math.random() * allMoves.length);
      } else if (state.challengeLevel === 2) {
        // Level 2: Target is a more distant valid move
        // Sort by distance and pick from the further half
        const sortedMoves = [...allMoves].sort((a, b) => {
          const distA = Math.abs(a[0] - startRow) + Math.abs(a[1] - startCol);
          const distB = Math.abs(b[0] - startRow) + Math.abs(b[1] - startCol);
          return distB - distA;
        });
        targetIndex = Math.floor(Math.random() * Math.min(3, sortedMoves.length));
        if (sortedMoves.length > 0) {
          state.targetCell = sortedMoves[targetIndex];
        } else {
          state.targetCell = allMoves[0];
        }
        state.highlightedSquares = [];
        state.captureSquares = [];
        state.message = `Level ${state.challengeLevel} Challenge: Move your ${state.selectedPiece.name} to capture the king!`;
        updateUI();
        return;
      } else {
        // Level 3+: No highlights shown, increasing difficulty
        targetIndex = Math.floor(Math.random() * allMoves.length);
      }
      
      state.targetCell = allMoves[targetIndex];
      
      // In Level 1, show all valid moves as hints
      if (state.challengeLevel === 1) {
        state.highlightedSquares = normalMoves;
        state.captureSquares = captureMoves;
      } else {
        state.highlightedSquares = [];
        state.captureSquares = [];
      }
      
      state.message = `Level ${state.challengeLevel} Challenge: Move your ${state.selectedPiece.name} to capture the king!`;
      updateUI();
    }

    // Update UI based on state
    function updateUI() {
      // Update message
      messageElement.textContent = state.message;
      
      // Update piece selection
      const pieceButtons = document.querySelectorAll('.piece-button');
      pieceButtons.forEach(button => {
        const pieceName = button.querySelector('.piece-name').textContent;
        if (state.selectedPiece && state.selectedPiece.name === pieceName) {
          button.classList.add('selected');
        } else {
          button.classList.remove('selected');
        }
      });
      
      // Update game mode buttons
      if (state.gameMode === 'learn') {
        learnModeButton.classList.add('active');
        challengeModeButton.classList.remove('active');
        levelDisplayElement.style.display = 'none';
      } else {
        learnModeButton.classList.remove('active');
        challengeModeButton.classList.add('active');
        levelDisplayElement.style.display = 'block';
        levelTextElement.textContent = `Level: ${state.challengeLevel}`;
        progressFillElement.style.width = `${(state.successCount / 3) * 100}%`;
      }
      
      // Update pawn legend visibility
      if (state.selectedPiece && state.selectedPiece.name === 'Pawn' && state.gameMode === 'learn') {
        pawnLegendElement.style.display = 'flex';
      } else {
        pawnLegendElement.style.display = 'none';
      }
      
      // Update chessboard
      updateChessboard();
      
      // Update game instructions
      if (state.gameMode === 'learn') {
        gameInstructionsElement.className = 'game-instructions learn-instructions';
        gameInstructionsElement.textContent = state.selectedPiece 
          ? "Click on the board to place your piece and see how it moves!" 
          : "First, choose a chess piece to learn about!";
      } else {
        gameInstructionsElement.className = 'game-instructions challenge-instructions';
        gameInstructionsElement.textContent = state.challengeLevel === 1 
          ? (state.selectedPiece?.name === 'Pawn' 
            ? "Green squares show where you can move, red squares show where you can capture. Get the king!" 
            : "Green squares show where you can move. Capture the king!") 
          : "Move your piece to capture the king!";
      }
    }

    // Update chessboard display
    function updateChessboard() {
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const isWhite = (row + col) % 2 === 0;
        
        // Reset cell classes
        cell.className = `cell ${isWhite ? 'white' : 'black'}`;
        cell.innerHTML = '';
        
        // Add highlight if needed
        if (isHighlighted(row, col)) {
          cell.classList.add('highlighted');
        }
        
        // Add capture highlight if needed
        if (isCapture(row, col)) {
          cell.classList.add('capture');
        }
        
        // Add selected style if needed
        if (isSelected(row, col)) {
          cell.classList.add('selected');
          if (state.selectedPiece) {
            const pieceEmoji = document.createElement('span');
            pieceEmoji.className = 'piece-emoji';
            pieceEmoji.textContent = state.selectedPiece.image;
            cell.appendChild(pieceEmoji);
          }
        }
        
        // Add target (king) if needed
        if (isTarget(row, col) && !isSelected(row, col)) {
          const kingEmoji = document.createElement('span');
          kingEmoji.className = 'piece-emoji';
          kingEmoji.textContent = '♚';
          cell.appendChild(kingEmoji);
        }
      });
    }

    // Helper functions to check cell states
    function isHighlighted(row, col) {
      return state.highlightedSquares.some(([r, c]) => r === row && c === col);
    }
    
    function isCapture(row, col) {
      return state.captureSquares.some(([r, c]) => r === row && c === col);
    }
    
    function isSelected(row, col) {
      return state.selectedCell && state.selectedCell[0] === row && state.selectedCell[1] === col;
    }
    
    function isTarget(row, col) {
      return state.targetCell && state.targetCell[0] === row && state.targetCell[1] === col;
    }

    // Show confetti animation
    function showConfetti() {
      const confettiCount = 50;
      const colors = ['#ef4444', '#3b82f6', '#facc15', '#22c55e', '#8b5cf6'];
      
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const size = Math.random() * 8 + 5;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 2 + 1;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.left = `${left}%`;
        confetti.style.top = '-10px';
        confetti.style.backgroundColor = color;
        confetti.style.animationDuration = `${animationDuration}s`;
        
        chessboardElement.appendChild(confetti);
        
        // Remove confetti after animation is complete
        setTimeout(() => {
          chessboardElement.removeChild(confetti);
        }, animationDuration * 1000);
      }
    }

    // Event listeners for game mode buttons
    learnModeButton.addEventListener('click', () => {
      state.gameMode = 'learn';
      state.message = `Learning mode: See how the ${state.selectedPiece?.name || 'piece'} moves!`;
      state.targetCell = null;
      updateUI();
    });

    challengeModeButton.addEventListener('click', startChallenge);

    // Initialize the game
    function init() {
      initPieceSelection();
      initChessboard();
      updateUI();
    }

    // Start the game
    init();