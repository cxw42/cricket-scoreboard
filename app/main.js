// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

/**
 * A cricket scoreboard
 *
 * @module app
 */

Display = require('display');
Team = require('team');
Score = require('score');

console.log('Hello, world!')

team1 = new Team('Pakistan', 'PAK', '#069d32');
team1.batters = {
    'Nauman': {
        runs: 0,
        balls: 0
    },
    'Azam': {
        runs: 0,
        balls: 0
    },
};
team2 = new Team('Sri Lanka', 'SL', '#0c4da1');
team2.batters = {
    'Dhananjaya': {
        runs: 64,
        balls: 118,
    },
    'Wellalage': {
        runs: 14,
        balls: 2,
    },
};

// team2 won the toss and elected to bat
display = new Display(document.body, team2, team1);
score = new Score([team1, team2], team2);
score.battingOrder = ['Dhananjaya', 'Wellalage'];
score.bowler = 'Nauman';

for(let i=0; i<6; ++i) {
    score.wicket()
}
score.addRuns(264);

setTimeout(() => {
    display.update(score);
}, 1000);
