// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

/**
 * The current situation of the match.  This is the data to show
 * on the OSD.
 *
 * @class Situation
 * @constructor
 * @param {object} data Values to save
 * @param {int} data.maxOvers Maximum number of overs (omit for first-class)
 * @param {Array[Team]} data.teams The teams, listed in the order
 *                      they are batting.
 * @param {Team} data.home Which team is the home team
 * @param {Team} data.toss Which team won the toss
 * @param {Team} data.battingNow Which team is currently batting
 */
class Situation {
    inningsIdx = 0; // 0 for first innings, 1 for second
    target = null; // only valid during the second innings
    wickets = 0;
    runs = 0;
    overs = 0;
    maxOvers; // null => first-class

    // which team batted first, second
    teams = [null, null];

    // each of home, toss must be === teams[0] or teams[1]
    home = null;
    toss = null;

    batters = ["", ""]; // batters' names
    batterRuns = [0, 0];
    batterBalls = [0, 0];

    onStrikeIdx = 0; // which batter is on strike
    bowler = ""; // bowler's name
    bowlerRuns = 0;
    bowlerWickets = 0;
    bowlerCompleteOvers = 0;

    // TODO DLS

    constructor(data) {
        for (const k in data) {
            this[k] = data[k];
        }
        if (this.toss !== this.teams[0] && this.toss !== this.teams[1]) {
            throw "Toss must have been won by one of the two teams";
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
}

module.exports = Situation;
