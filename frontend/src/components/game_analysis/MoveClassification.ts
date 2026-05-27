type MoveClassification = 'Best' | 'Inaccuracy' | 'Blunder' | 'Pending';

export function getClassification(evals: (number | null)[], playedCol: number): { type: MoveClassification, bestCols: number[] } {
    const validEvals = evals.filter((e): e is number => e !== null);
    if (validEvals.length === 0) return { type: 'Pending', bestCols: [] };

    const maxEval = Math.max(...validEvals);
    const playedEval = evals[playedCol];

    const bestCols = evals
        .map((e, idx) => (e !== null && e === maxEval) ? idx : -1)
        .filter(idx => idx !== -1);

    if (playedEval === null) return { type: 'Pending', bestCols: [] };
    if (playedEval === maxEval) return { type: 'Best', bestCols };
    if (maxEval > 0 && playedEval <= 0) return { type: 'Blunder', bestCols };
    if (maxEval === 0 && playedEval < 0) return { type: 'Blunder', bestCols };

    return { type: 'Inaccuracy', bestCols };
}
