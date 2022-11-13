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
    firstInnings = true; // bool
    target = null; // only valid during the second innings
    wickets = 0;
    runs = 0;
    overs = 0;
    maxOvers; // null => first-class

    // TODO DLS

    constructor(maxOvers = null) {
        this.maxOvers = maxOvers;
    }

    addRuns(runs) {
        this.runs += runs;
    }

    wicket() {
        ++this.wickets;
    }

    // Call this at the end of the first innings
    finishFirstInnings() {
        firstInnings = false;
        target = runs + 1;

        wickets = 0;
        runs = 0;
        overs = 0;
    }
};

module.exports = Score;
