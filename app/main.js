// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

Display = require('display');
Team = require('team');
Score = require('score');

console.log('Hello, world!')

team1 = new Team('England', 'ENG', '#fc2d38');
team1.batters = {
    'Ali': {
        runs: 0,
        balls: 0
    },
    'Stokes': {
        runs: 0,
        balls: 0
    },
};
team2 = new Team('India', 'IND', '#1f66e0');
team2.batters = {
    'Kohli': {
        runs: 0,
        balls: 0
    },
    'Shaw': {
        runs: 0,
        balls: 0
    },
};

display = new Display(document.body, team1, team2);

// team1 won the toss and elected to bat
score = new Score([team1, team2], team1);
score.battingOrder = ['Ali', 'Stokes'];
score.bowler = 'Kohli';

score.wicket()
score.addRuns(42);

setTimeout(() => {
    display.update(score);
}, 1000);
