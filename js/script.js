// board is kept private via closure so it can only be changed through
// placeMark/resetBoard, never overwritten or corrupted directly from
// outside the module. Only these four methods are revealed - everything
// else about how the board is stored stays an internal detail.
const Gameboard = (function () {
	const board = Array(9).fill("")

	const isCellEmpty = (index) => board[index] === ""
	// Guards against overwriting an existing mark - without this check,
	// a player could click an already-taken cell and silently replace
	// the other player's mark.
	const placeMark = (index, marker) => {
		if (isCellEmpty(index)) {
			board[index] = marker
		}
	}
	const getBoard = () => board
	const resetBoard = () => board.fill("")

	return { placeMark, isCellEmpty, getBoard, resetBoard }
})()

const createPlayer = (name, marker) => {
	const getName = () => name
	const getMarker = () => marker

	return { getName, getMarker }
}

const GameController = (function () {
	const playerOne = createPlayer("Player One", "X")
	const playerTwo = createPlayer("Player Two", "O")
	let gameOver = false
	let activePlayer = playerOne
	// Each triplet is a set of board indices that form a win: rows,
	// columns, then two diagonals.
	const winningLines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	]

	const switchTurn = () =>
		activePlayer === playerOne
			? (activePlayer = playerTwo)
			: (activePlayer = playerOne)

	// Checks all 8 possible lines; wins the instant any line has three
	// matching, non-empty marks.
	const checkWin = () => {
		const board = Gameboard.getBoard()
		return winningLines.some(
			(line) =>
				board[line[0]] === board[line[1]] &&
				board[line[1]] === board[line[2]] &&
				board[line[0]] !== "",
		)
	}

	const isBoardFull = () => {
		return Gameboard.getBoard().every((cell) => cell !== "")
	}

	// Blocks further moves once the game gas ended, so a leftover click
	// can't corrupt a finished board.
	const playRound = (index) => {
		if (gameOver) return
		if (!Gameboard.isCellEmpty(index)) return "Cell already taken"
		Gameboard.placeMark(index, activePlayer.getMarker())
		if (checkWin()) {
			gameOver = true
			return `${activePlayer.getName()} wins!`
		} else if (isBoardFull()) {
			gameOver = true
			return `Tie game!`
		} else {
			switchTurn()
			return `${activePlayer.getName()}'s turn`
		}
	}

	const getGameOver = () => gameOver
	const getActivePlayer = () => activePlayer

	return { playRound, getActivePlayer, getGameOver }
})()

const DisplayController = (function () {
	const container = document.querySelector("#board")
	const status = document.querySelector("#status")

	// Clears and rebuilds every cell on each call instead of updating just
	// the changed one - for a 9-cell board the cost is negligible, and it
	// guarantees the display can never drift out of sync with Gameboard's actual state.
	const renderBoard = () => {
		container.replaceChildren()
		const board = Gameboard.getBoard()

		board.forEach((cell, index) => {
			const btn = document.createElement("button")
			btn.dataset.index = index
			btn.textContent = cell
			container.appendChild(btn)
		})
	}

	// One listener on the container instead of one per button - cells get
	// rebuilt on every render, so per-button listeners would need to be
	// reattached each time. Delegation avoids that entirely.
	container.addEventListener("click", (e) => {
		const index = Number(e.target.dataset.index)
		status.textContent = GameController.playRound(index)
		renderBoard()
	})

	// Renders the empty board on load so there's something to click
	// before any move has been made
	renderBoard()
	return { renderBoard }
})()
