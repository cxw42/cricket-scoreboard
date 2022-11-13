// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

Two = require('two.js');
Score = require('score');

// 1080p, but divided by 2 to be more visible on screen.
const SCALE = 2;
const WIDTH = 1920 / SCALE;
const HEIGHT = 1080 / SCALE;
const BANNER_WIDTH = 680 / SCALE;
const BANNER_TOP = 900 / SCALE;
const BANNER_BOTTOM = 1040 / SCALE;

class Display {
    _two = null; // note: brunch doesn't do `#private`
    _team1;
    _team2;
    _toss;

    /**
     * toss === team1 or team2
     */
    constructor(parentElement, team1, team2, toss) {
        this._team1 = team1;
        this._team2 = team2;
        this._toss = toss;

        if ((toss !== team1) && (toss !== team2)) {
            throw "Toss must have been won by one of the two teams"
        }

        // Modified from the two.js sample
        // Make an instance of two and place it on the page.
        let params = {
            width: WIDTH,
            height: HEIGHT,
        };
        this._two = new Two(params).appendTo(parentElement);
        this._two.renderer.domElement.style.background = '#ddd'; // DEBUG

        this._team1Banner = this._two.makeRectangle(BANNER_WIDTH / 2, BANNER_TOP, BANNER_WIDTH, BANNER_BOTTOM - BANNER_TOP);
        this._team1Banner.corner();
        this._team1Banner.fill = team1.color;
        this._team1Banner.opacity = 0.75;
        this._team1Banner.noStroke();

        this._team2Banner = this._two.makeRectangle(WIDTH - BANNER_WIDTH / 2, BANNER_TOP, BANNER_WIDTH, BANNER_BOTTOM - BANNER_TOP);
        this._team2Banner.corner();
        this._team2Banner.fill = team2.color;
        this._team2Banner.opacity = 0.75;
        this._team2Banner.noStroke();

        this._two.update();
    }

    update(score) {
        let wkts = new Two.Text(`${score.wickets}-${score.runs}`, WIDTH / 2, BANNER_TOP + (BANNER_BOTTOM - BANNER_TOP) / 2);
        this._two.add(wkts);
        this._two.update();
    }

}

module.exports = Display;
