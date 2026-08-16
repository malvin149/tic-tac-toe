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
