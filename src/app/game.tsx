"use client";

import {useState} from "react";

// literals type for the game result, including a draw, or not finished yet.
type FinishedStatus = 'Draw' | 'Has Winner';
type GameStatus = FinishedStatus | 'Not Finished';
interface GameResult {
    status: GameStatus,
    winner?: string,
    winnerLine?: number[],
}

interface SquareProps {
    value: string,
    onSquareClick: () => void,
    highlight?: boolean | undefined
}

function Square({value, onSquareClick, highlight}: SquareProps) {
    return (
        <button className={`square ${highlight ? 'highlighted-square' : ''}`}
                onClick={onSquareClick}>
            {value}
        </button>
    );
}

function Board({xIsNext, squares, onPlay} : {xIsNext: boolean, squares: string[], onPlay: (squares: string[]) => void}) {
    const {status, winner, winnerLine} = calculateGameResult(squares);
    let statusInfo: string;
    switch (status) {
        case 'Has Winner':
            statusInfo = `Winner: ${winner}`;
            break;
        case 'Draw':
            statusInfo = 'Draw';
            break;
        case 'Not Finished':
            statusInfo = `Next player: ${xIsNext ? 'X' : 'O'}`;
            break;
        default:
            throw new Error('Invalid game status');
    }
    
    function handleClick(i: number) {
        // If the square is already filled, or game is finished before this move, do nothing.
        if (squares[i] || status !== 'Not Finished') {
            return;
        }
        const nextSquares = squares.slice();
        nextSquares[i] = xIsNext ? 'X' : 'O';
        onPlay(nextSquares);
    }

    const nRows = 3;
    const nCols = 3;
    
    return (
        <>
            <div className='status'>{statusInfo}</div>
            {[...Array(nRows)].map((_, row) => (
                <div className='board-row' key={row}>
                    {[...Array(nCols)].map((_, col) => {
                        const index = row * nCols + col;
                        const highlight = Array.isArray(winnerLine) && winnerLine.includes(index);
                        return (
                            <Square key={index}
                                    value={squares[index]}
                                    highlight={highlight}
                                    onSquareClick={() => handleClick(index)}/>
                        )
                    })}
                </div>
            ))}
        </>
    )
}

/**
 * Calculate the winner of the game
 * @param squares current game board
 * @returns if no winner, return null; otherwise, return the winning line indices. 
 * The actual winner can be inferred from the first element of the returned array.
 */
function calculateGameResult(squares: string[]): GameResult {
    const gameResult: GameResult = {
        status: 'Not Finished',
    }
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            gameResult.status = 'Has Winner';
            gameResult.winner = squares[a];
            gameResult.winnerLine = lines[i];
            return gameResult;
        }
    }
    
    // if all squares are filled, then it's a draw.
    gameResult.status = squares.every(Boolean) ? 'Draw' : 'Not Finished';
    return gameResult;
}

export default function Game() {
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const [sortAscend, setSortAscend] = useState(true);
    
    const xIsNext = currentMove % 2 === 0;
    const currentSquares = history[currentMove];
    
    function handlePlay(nextSquares: string[]) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }
    
    function jumpTo(nextMove: number) {
        setCurrentMove(nextMove);
    }

    function toggleSort() {
        setSortAscend(!sortAscend);
    }
    
    // a list of [row, col] for each move, deduced from history.
    const moveLocations: ([number, number] | null)[] = history.map((squares, move) => {
        if (move === 0) {
            return null;
        }
        const prevSquares = history[move - 1];
        for (let i = 0; i < squares.length; i++) {
            if (squares[i] !== prevSquares[i]) {
                return [Math.floor(i / 3), i % 3];
            }
        }
        throw new Error('Invalid move');
    });
    
    let moves = history.map((squares, move) => {
        const currentMoveLabel = `You are at move #${move}`;
        let goToLabel = move > 0 ? `Go to move #${move}` : 'Go to game start';
        
        // add location suffix if available
        let moveLocationSuffix = '';
        if (moveLocations[move]) {
            const [moveRow, moveCol] = moveLocations[move];
            moveLocationSuffix = ` @ (${moveRow + 1}, ${moveCol + 1})`;
        }
        
        return currentMove === move ? ( // current move
            <li key={move}>
                <button>
                    {currentMoveLabel}{moveLocationSuffix} 
                </button>
            </li>
        ) : ( // other moves, with a button to jump to that move.
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{goToLabel}{moveLocationSuffix}</button>
            </li>
        );
    });
    
    moves = sortAscend ? moves : moves.reverse();

    return (
        <div className="game">
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
            </div>
            <div className="game-info">
                <button onClick={toggleSort}>
                    {sortAscend ? 'Sort Descend' : 'Sort Ascend'}
                </button>
                <ol className='list-decimal'>{moves}</ol>
            </div>
        </div>
    );
}