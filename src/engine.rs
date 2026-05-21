use std::collections::HashMap;
use crate::bitboard::{Board, COLS, ROWS};

pub const TOTAL_CELLS: u32 = ROWS * COLS; // 42

/// Default move ordering — center-first.
pub const DEFAULT_MOVE_ORDER: [u32; COLS as usize] = [3, 2, 4, 1, 5, 0, 6];

pub const TRANSPOSITION_TABLE_SIZE: usize = 1 << 20; // 2^20 entries for the array cache
const TRANSPOSITION_TABLE_MASK: u64 = (TRANSPOSITION_TABLE_SIZE - 1) as u64;

/// Default moves_played threshold below which positions go into the HashMap.
/// Positions with moves_played <= this value are stored in the all-way associative
/// HashMap (no collisions, exact lookup). Deeper positions use the array.
const DEFAULT_EXACT_DEPTH: u32 = 18;

const MIN_EVAL: i32 = -18;
const MAX_EVAL: i32 = 18;

/// Win score = 22 - moves_played_by_winner.
#[inline]
fn win_score(moves_played: u32) -> i32 {
    22 - ((moves_played + 2) / 2) as i32
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Bound {
    /// Score is a lower bound (came from a beta cutoff)
    Lower,
    /// Score is an upper bound (no cutoff was found)
    Upper,
}

#[derive(Clone, Copy)]
pub struct TranspositionTableEntry {
    pub key:   u64,
    pub score: i8,
    pub bound: Bound,
}

/// Hybrid transposition table.
///
/// - Positions with `moves_played <= exact_depth` are stored in a `HashMap`
///   (all-way associative: no collisions, exact lookup). These are the most
///   expensive nodes — near the root of the search tree — so correctness matters.
/// - All other positions use a fixed-size array (one-way associative, may collide).
///   These are cheap to recompute and benefit more from raw lookup speed.
pub struct TranspositionTable {
    /// All-way associative cache for shallow (expensive) positions
    all_way_table: HashMap<u64, TranspositionTableEntry>,
    /// One-way associative array cache for deeper (cheaper) positions
    one_way_table: Vec<TranspositionTableEntry>,
    /// moves_played threshold: <= this goes into `exact`, > this goes into `array`
    pub all_way_max_depth: u32,
}

impl TranspositionTable {
    pub fn new() -> Self {
        Self::with_exact_depth(DEFAULT_EXACT_DEPTH)
    }

    pub fn with_exact_depth(exact_depth: u32) -> Self {
        TranspositionTable {
            all_way_table: HashMap::new(),
            one_way_table: vec![TranspositionTableEntry { key: 0, score: 0, bound: Bound::Lower }; TRANSPOSITION_TABLE_SIZE],
            all_way_max_depth: exact_depth,
        }
    }

    #[inline]
    fn array_index(key: u64) -> usize {
        (key & TRANSPOSITION_TABLE_MASK) as usize
    }

    #[inline]
    pub fn store(&mut self, key: u64, score: i32, bound: Bound, moves_played: u32) {
        let entry = TranspositionTableEntry { key, score: score as i8, bound };

        if moves_played <= self.all_way_max_depth {
            self.all_way_table.insert(key, entry);
        } else {
            let idx = Self::array_index(key);
            self.one_way_table[idx] = entry;
        }
    }

    #[inline]
    pub fn get(&self, key: u64, moves_played: u32) -> Option<TranspositionTableEntry> {
        if moves_played <= self.all_way_max_depth {
            self.all_way_table.get(&key).copied()
        } else {
            let entry = self.one_way_table[Self::array_index(key)];

            if entry.key == key {
                Some(entry)
            } else {
                None
            }
        }
    }
}

/// Negamax with a caller-supplied move ordering and transposition table.
/// `nodes` is incremented once per call (i.e. per position visited).
pub fn evaluate_position(
    board: &Board,
    mut alpha: i32,
    mut beta: i32,
    transposition_table: &mut TranspositionTable,
    node_count: &mut u64,
) -> i32 {
    *node_count += 1;

    let curr_conn4 = board.current_player_connect4();
    let opp_conn4 = board.last_player_connect4();

    if curr_conn4 && opp_conn4 {
        return 0;
    }

    if curr_conn4 {
        return win_score(board.moves_played);
    }

    // Draw: board completely full, no winner found above us
    if board.moves_played == TOTAL_CELLS {
        return 0;
    }

    // Check for an immediate win before recursing.
    for next in board.next_positions_ordered(&DEFAULT_MOVE_ORDER) {

        if !next.current_player_connect4() && next.last_player_connect4() {
            return win_score(board.moves_played);
        }
    }

    // Tighten alpha and beta
    alpha = alpha.max(-win_score(board.moves_played + 1));
    beta = beta.min(win_score(board.moves_played + 2));

    if alpha >= beta {
        return beta;
    }

    let key = board.key();

    // Transposition table lookup
    if let Some(entry) = transposition_table.get(key, board.moves_played) {
        match entry.bound {
            Bound::Lower => alpha = alpha.max(entry.score as i32),
            Bound::Upper => beta = beta.min(entry.score as i32),
        }
        if alpha >= beta {
            return entry.score as i32;
        }
    }

    for next in board.next_positions_ordered(&DEFAULT_MOVE_ORDER) {

        if let Some(entry) = transposition_table.get(next.key(), next.moves_played) {
            if Bound::Upper == entry.bound {
                alpha = alpha.max(-entry.score as i32);
            }

            if alpha >= beta {
                return alpha;
            }
        }
    }

    let mut first_move = true;

    for next in board.next_positions_ordered(&DEFAULT_MOVE_ORDER) {

        let score = if first_move {
            first_move = false;
            -evaluate_position(&next, -beta, -alpha, transposition_table, node_count)
        } else {
            let null_score = -evaluate_position(&next, -alpha - 1, -alpha, transposition_table, node_count);

            if null_score > alpha && null_score < beta {
                -evaluate_position(&next, -beta, -null_score, transposition_table, node_count)
            } else {
                null_score
            }
        };

        if score >= beta {
            transposition_table.store(key, score, Bound::Lower, board.moves_played);
            return score;
        }
        if score > alpha {
            alpha = score;
        }
    }

    transposition_table.store(key, alpha, Bound::Upper, board.moves_played);
    alpha
}

/// Solve a position, returning the minimax score and the number of nodes searched.
pub fn solve_predefined_transposition_table(
    board: &Board,
    transposition_table: &mut TranspositionTable
) -> (i32, u64) {
    let mut nodes = 0u64;
    let score = evaluate_position(board, MIN_EVAL, MAX_EVAL, transposition_table, &mut nodes);
    (score, nodes)
}

/// Convenience: create a fresh TT and solve, returning score and node count.
pub fn solve(board: &Board) -> (i32, u64) {
    let mut transposition_table = TranspositionTable::new();
    solve_predefined_transposition_table(board, &mut transposition_table)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_start_position() {
        let board = Board::from_str(
            ". . . . . . .
             . . . . . . .
             . . . . . . .
             . . . . . . .
             . . . . . . .
             . . . . . . ."
        );

        board.display();

        let (score, pos) = solve(&board);

        println!("Positions: {}", pos);

        assert_eq!(score, 1, "Game should be a draw, got score={}", score);
    }
}
