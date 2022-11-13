// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

Display = require('display');
Team = require('team');
Score = require('score');

console.log('Hello, world!')

display = new Display(document.body);

score = new Score();
score.wicket()
score.addRuns(42);

setTimeout(() => {
    display.update(score);
}, 1000);
