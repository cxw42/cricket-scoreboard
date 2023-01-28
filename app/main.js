// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

/**
 * A cricket scoreboard
 *
 * @module app
 */

let Display = require("display");
let Team = require("team");
let Score = require("score");

console.log("Hello, world!");

let team1 = new Team("Pakistan", "PAK", "#069d32");
team1.batters = {
    Nauman: {
        runs: 0,
        balls: 0,
    },
    Azam: {
        runs: 0,
        balls: 0,
    },
};
let team2 = new Team("Sri Lanka", "SL", "#0c4da1");
team2.batters = {
    Dhananjaya: {
        runs: 64,
        balls: 118,
    },
    Wellalage: {
        runs: 14,
        balls: 2,
    },
};

// team2 won the toss and elected to bat
let display = new Display(document.body, team2, team1);
let score = new Score([team1, team2], team2);
score.battingOrder = ["Dhananjaya", "Wellalage"];
score.bowler = "Nauman";

for (let i = 0; i < 6; ++i) {
    score.wicket();
}
score.addRuns(264);

setTimeout(() => {
    display.update(score);
}, 100);

/////////////////////////////////////////////////////////////////// XXX tests

class Foo {
    member;
    constructor(val) {
        this.member = 'From foo ' + val;
        this.ctorMember = 'From foo ctor';
    }
}
class Bar extends Foo {
    childMember;
    constructor() {
        super(42);
        this.childMember = 'From Bar.  Foo said: ' + this.member;
        this.childCtorMember = 'from bar ctor.  Foo said:' + this.ctorMember;
    }
}

// XXX for debugging, export our internals.
module.exports = {
    display,
    score,
    team1,
    team2,
    Foo,
    Bar,
};

/*************************************************************************
 * Test of Textbox corner options
const Snap = require('snapsvg');
const Textbox = require('textbox');

let svg = Snap();
svg.rect(0, 0, 100, 100).attr({
    stroke: 'none',
    fill: '#ffc'
});
svg.circle(50, 50, 2);

let texts = {};
for (const corner of ['tl', 'ml', 'bl', 'tc', 'mc', 'bc', 'tr', 'mr', 'br']) {
    texts[corner] = new Textbox(svg, 50, 50, 50, 50, corner, [{
        text: corner
    }]);
}

module.exports = {
    svg,
    texts,
};
*************************************************************************/
