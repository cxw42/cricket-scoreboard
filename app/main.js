// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

Display = require('display');
Team = require('team');
Score = require('score');

console.log('Hello, world!')

team1 = new Team('England', 'ENG', '#fc2d38');
team2 = new Team('India', 'IND', '#1f66e0');

display = new Display(document.body, team1, team2, team1);

score = new Score();
score.wicket()
score.addRuns(42);

setTimeout(() => {
    display.update(score);
}, 1000);
