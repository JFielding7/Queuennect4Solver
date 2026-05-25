import { useState, useCallback } from 'react';
import type { CellState } from './Cell';
import type { GameStatus } from './StatusBar';

const COLS = 7;
const ROWS = 6;

export interface MoveRecord {
    player: 'player' | 'engine';
    col: number;
}

function emptyGrid(): CellState[][] {
    return Array.from({ length: COLS }, () => Array<CellState>(ROWS).fill('empty'));
}

function gridToFlatString(grid: CellState[][]): string {
    let s = '';
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = grid[col][row];
            if (cell === 'engine') s += 'X';
            else if (cell === 'player') s += 'O';
            else s += '.';
        }
    }
    return s;
}

function checkWin(grid: CellState[][], piece: CellState): { col: number, row: number }[] | null {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col <= COLS - 4; col++) {
            if (grid[col][row] === piece && grid[col+1][row] === piece &&
                grid[col+2][row] === piece && grid[col+3][row] === piece)
                return [{col, row}, {col: col+1, row}, {col: col+2, row}, {col: col+3, row}];
        }
    }
    for (let col = 0; col < COLS; col++) {
        for (let row = 0; row <= ROWS - 4; row++) {
            if (grid[col][row] === piece && grid[col][row+1] === piece &&
                grid[col][row+2] === piece && grid[col][row+3] === piece)
                return [{col, row}, {col, row: row+1}, {col, row: row+2}, {col, row: row+3}];
        }
    }
    for (let col = 0; col <= COLS - 4; col++) {
        for (let row = 0; row <= ROWS - 4; row++) {
            if (grid[col][row] === piece && grid[col+1][row+1] === piece &&
                grid[col+2][row+2] === piece && grid[col+3][row+3] === piece)
                return [{col, row}, {col: col+1, row: row+1}, {col: col+2, row: row+2}, {col: col+3, row: row+3}];
        }
    }
    for (let col = 0; col <= COLS - 4; col++) {
        for (let row = 3; row < ROWS; row++) {
            if (grid[col][row] === piece && grid[col+1][row-1] === piece &&
                grid[col+2][row-2] === piece && grid[col+3][row-3] === piece)
                return [{col, row}, {col: col+1, row: row-1}, {col: col+2, row: row-2}, {col: col+3, row: row-3}];
        }
    }
    return null;
}

function dropPiece(grid: CellState[][], col: number, piece: CellState): CellState[][] | null {
    if (grid[col][ROWS - 1] !== 'empty') return null;
    const next = grid.map(c => [...c]);
    for (let row = ROWS - 1; row > 0; row--) {
        next[col][row] = next[col][row - 1];
    }
    next[col][0] = piece;
    return next;
}

function isBoardFull(grid: CellState[][]): boolean {
    return grid.every(col => col[ROWS - 1] !== 'empty');
}

async function fetchBestMoves(grid: CellState[][]): Promise<number[]> {
    const board = gridToFlatString(grid);
    const res = await fetch('http://localhost:8080/api/best_moves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.best_moves as number[];
}

export type PlayerOrder = 'first' | 'second';

export interface GameState {
    grid: CellState[][];
    status: GameStatus;
    playerOrder: PlayerOrder | null;
    winningCells: { col: number, row: number }[] | null;
    moveHistory: MoveRecord[];
    startGame: (order: PlayerOrder) => void;
    handleColumnClick: (col: number) => void;
}

export function useGameState(): GameState {
    const [grid, setGrid] = useState<CellState[][]>(emptyGrid);
    const [status, setStatus] = useState<GameStatus>('player-turn');
    const [playerOrder, setPlayerOrder] = useState<PlayerOrder | null>(null);
    const [winningCells, setWinningCells] = useState<{ col: number, row: number }[] | null>(null);

    const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);

    const runEngineMove = useCallback(async (currentGrid: CellState[][]) => {
        setStatus('engine-turn');
        try {
            const moves = await fetchBestMoves(currentGrid);
            const col = moves[Math.floor(Math.random() * moves.length)];

            const next = dropPiece(currentGrid, col, 'engine');
            if (!next) return;

            const engineWins = checkWin(next, 'engine');
            const playerWins = checkWin(next, 'player');

            setGrid(next);
            setMoveHistory(prev => [...prev, { player: 'engine', col }]);

            if (engineWins && playerWins) {
                setStatus('draw');
            } else if (engineWins) {
                setStatus('engine-win');
                setWinningCells(engineWins);
            } else if (playerWins) {
                setStatus('player-win');
                setWinningCells(playerWins);
            } else if (isBoardFull(next)) {
                setStatus('draw');
            } else {
                setStatus('player-turn');
            }
        } catch (e) {
            console.error('Engine move failed:', e);
            setStatus('player-turn');
        }
    }, []);

    const startGame = useCallback(async (order: PlayerOrder) => {
        const fresh = emptyGrid();
        setGrid(fresh);
        setPlayerOrder(order);
        setWinningCells(null);
        setMoveHistory([]);

        if (order === 'second') {
            await runEngineMove(fresh);
        } else {
            setStatus('player-turn');
        }
    }, [runEngineMove]);

    const handleColumnClick = useCallback(async (col: number) => {
        if (status !== 'player-turn') return;

        const next = dropPiece(grid, col, 'player');
        if (!next) return;

        const playerWins = checkWin(next, 'player');
        const engineWins = checkWin(next, 'engine');

        setGrid(next);
        setMoveHistory(prev => [...prev, { player: 'player', col }]);

        if (playerWins && engineWins) { setStatus('draw'); return; }
        if (playerWins) {
            setStatus('player-win');
            setWinningCells(playerWins);
            return;
        }
        if (engineWins) {
            setStatus('engine-win');
            setWinningCells(engineWins);
            return;
        }
        if (isBoardFull(next)) { setStatus('draw'); return; }

        await runEngineMove(next);
    }, [grid, status, runEngineMove]);

    return { grid, status, playerOrder, winningCells, moveHistory, startGame, handleColumnClick };
}