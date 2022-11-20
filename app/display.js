// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

Two = require('two.js');

BatterBox = require('batterbox');
Score = require('score');
Textbox = require('textbox');

// 1080p, but divided by 2 to be more visible on screen.
const SCALE = 2;
const WIDTH = 1920 / SCALE;
const HEIGHT = 1080 / SCALE;
const BANNER_WIDTH = 600 / SCALE;
const BANNER_TOP = 950 / SCALE;
const BANNER_BOTTOM = 1040 / SCALE;

// Computed dimensions
const BANNER_HEIGHT = BANNER_BOTTOM - BANNER_TOP;

class Display {
    _two = null; // note: brunch doesn't do `#private`
    _team1;
    _team2;

    constructor(parentElement, team1, team2) {
        this._team1 = team1;
        this._team2 = team2;

        // Modified from the two.js sample
        // Make an instance of two and place it on the page.
        let params = {
            width: WIDTH,
            height: HEIGHT,
        };
        this._two = new Two(params).appendTo(parentElement);
        this._two.renderer.domElement.style.background = '#ddd'; // DEBUG

        this._bg = new Two.ImageSequence(['slc-sample.png'], WIDTH / 2,
            HEIGHT / 2, 0);
        this._two.add(this._bg);

        // Color backgrounds
        this._team1Banner = this._two.makeRectangle(BANNER_WIDTH / 2,
            BANNER_TOP + BANNER_HEIGHT / 2, BANNER_WIDTH, BANNER_HEIGHT);
        this._team1Banner.corner();
        this._team1Banner.fill = team1.color;
        this._team1Banner.opacity = 0.75;
        this._team1Banner.noStroke();

        this._team2Banner = this._two.makeRectangle(WIDTH - BANNER_WIDTH /
            2, BANNER_TOP + BANNER_HEIGHT / 2, BANNER_WIDTH,
            BANNER_HEIGHT);
        this._team2Banner.corner();
        this._team2Banner.fill = team2.color;
        this._team2Banner.opacity = 0.75;
        this._team2Banner.noStroke();

        // Players' names
        let textStyles = {
            family: 'Rubik, sans-serif',
            style: 'italic',
            weight: 550,
            size: '1em',
            alignment: 'right',
        };

        this.batterOnStrike = new Textbox(
            0, BANNER_TOP, BANNER_WIDTH, BANNER_HEIGHT / 2, 'tl',
            textStyles);
        this.batterOnStrike.addTo(this._two);

        this.batterNotOnStrike = new Textbox(
            0, BANNER_TOP + BANNER_HEIGHT / 2, BANNER_WIDTH,
            BANNER_HEIGHT / 2, 'tl', textStyles);
        this.batterNotOnStrike.addTo(this._two);

        this.bowler = new Textbox(WIDTH - BANNER_WIDTH,
            BANNER_TOP, BANNER_WIDTH, BANNER_HEIGHT, 'tl', textStyles);
        this.bowler.addTo(this._two);

        // Innings score
        this.wkts = new Two.Text('0-0', WIDTH / 2,
            BANNER_TOP + (BANNER_BOTTOM - BANNER_TOP) / 2);
        this._two.add(this.wkts);

        this.batterbox = new BatterBox(100, 100, BANNER_WIDTH,
            BANNER_HEIGHT / 2, textStyles);
        this.batterbox.addTo(this._two);

        this._two.update();
    }

    update(score) {
        this.wkts.value = `${score.wickets}-${score.runs}`;
        this.batterOnStrike.setValue(score.battingOrder[0]); // XXX
        this.batterNotOnStrike.setValue(score.battingOrder[1]); // XXX
        this.bowler.setValue(score.bowler);

        this.batterbox.name = score.battingOrder[0];
        this.batterbox.runs = 64;
        this.batterbox.balls = 118;

        this._two.update();
    }

}

module.exports = Display;
