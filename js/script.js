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
