// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

/**
 * The current score
 *
 * @class Score
 * @constructor
 */
class Score {
    inningsIdx = 0; // 0 for first innings, 1 for second
    target = null; // only valid during the second innings
    wickets = 0;
    runs = 0;
    overs = 0;
    maxOvers; // null => first-class

    // which team batted first, second
    battingTeams = [null, null];

    /**
     * toss === battingTeams[0] or battingTeams[1]
     */
    toss = null;

    battingOrder = []; // batting order in the current innings --- array of str

    bowler = ''; // bowler's name

    // TODO DLS

    constructor(maxOvers = null, teams, toss) {
        this.maxOvers = maxOvers;
        this.battingTeams = teams;
        this.toss = toss;
        if ((toss !== teams[0]) && (toss !== teams[1])) {
            throw "Toss must have been won by one of the two teams"
        }

    }

    addRuns(runs) {
        this.runs += runs;
    }

    wicket() {
        ++this.wickets;
    }

    // Call this at the end of the first innings
    finishFirstInnings() {
        inningsIdx = 1;
        target = runs + 1;

        wickets = 0;
        runs = 0;
        overs = 0;
    }
};

module.exports = Score;
