"use client";

import {useState} from "react";
import {Simulate} from "react-dom/test-utils";

function Square({value, onSquareClick} : {value: string, onSquareClick: () => void}) {
    return (
        <button className="square" onClick={onSquareClick}>
            {value}
        </button>
    );
}

function Board({xIsNext, squares, onPlay} : {xIsNext: boolean, squares: string[], onPlay: (squares: string[]) => void}) {
    const winnerLine = calculateWinnerLine(squares);
    const winner = winnerLine ? squares[winnerLine[0]] : null;
    let status = winner ? `Winner: ${winner}` : `Next player: ${xIsNext ? 'X' : 'O'}`;
    
    function handleClick(i: number) {
        // If the square is already filled, or there is a winner before this move, do nothing.
        if (squares[i] || winner) {
            return;
        }
        const nextSquares = squares.slice();
        nextSquares[i] = xIsNext ? 'X' : 'O';
        onPlay(nextSquares);
    }

    const n_rows = 3;
    const n_cols = 3;
    
    return (
        <>
            <div className='status'>{status}</div>
            {[...Array(n_rows)].map((_, row) => (
                <div className='board-row' key={row}>
                    {[...Array(n_cols)].map((_, col) => {
                        const index = row * n_cols + col;
                        return (
                            <Square key={index}
                                    value={squares[index]}
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
function calculateWinnerLine(squares: string[]): number[] | null {
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
            return lines[i];
        }
    }
    return null;
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
    
    let moves = history.map((squares, move) => {
        let description = move > 0 ? `Go to move #${move}` : 'Go to game start';
        return currentMove === move ? (
            <li key={move}>
                <button className='btn btn-blue'>You are at move #{move}</button>
            </li>
        ) : (
            <li key={move}>
                <button className='btn btn-blue' onClick={() => jumpTo(move)}>{description}</button>
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
                <button className='btn btn-blue' onClick={toggleSort}>
                    {sortAscend ? 'Sort Descend' : 'Sort Ascend'}
                </button>
                <ol className='list-decimal'>{moves}</ol>
            </div>
        </div>
    );
}