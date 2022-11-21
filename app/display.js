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
const BANNER_HEIGHT = 90 / SCALE;

// Computed dimensions

// Dimensions from <https://tech.ebu.ch/docs/techreview/trev_280-baker.pdf>
const ACTION_MARGIN_W = (WIDTH * 0.035) | 0; // action-safe area, 16:9
const ACTION_MARGIN_H = (HEIGHT * 0.035) | 0;
const GRAPHICS_MARGIN_W = (WIDTH * 0.10) | 0; // graphics-safe area, 16:9
const GRAPHICS_MARGIN_H = (HEIGHT * 0.05) | 0;

const BANNER_BOTTOM = HEIGHT - ACTION_MARGIN_H;
const BANNER_TOP = BANNER_BOTTOM - BANNER_HEIGHT;
// banner extends to the edges of the screen
const BANNER_FULL_WIDTH = BANNER_WIDTH + ACTION_MARGIN_W;

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

        // Background image
        this._bg = new Two.ImageSequence(['slc-sample.png'], WIDTH / 2,
            HEIGHT / 2, 0);
        this._two.add(this._bg);

        // Color backgrounds
        this._team1Banner = this._two.makeRectangle(BANNER_FULL_WIDTH / 2,
            BANNER_TOP + BANNER_HEIGHT / 2, BANNER_FULL_WIDTH,
            BANNER_HEIGHT);
        this._team1Banner.corner();
        this._team1Banner.fill = team1.color;
        this._team1Banner.opacity = 1;
        this._team1Banner.noStroke();

        this._team2Banner = this._two.makeRectangle(WIDTH -
            (BANNER_FULL_WIDTH / 2), BANNER_TOP + BANNER_HEIGHT / 2,
            BANNER_FULL_WIDTH, BANNER_HEIGHT);
        this._team2Banner.corner();
        this._team2Banner.fill = team2.color;
        this._team2Banner.opacity = 1;
        this._team2Banner.noStroke();

        // Players' names
        let textStyles = {
            family: 'Rubik, sans-serif',
            style: 'italic',
            weight: 550,
            size: '1em',
            alignment: 'right',
        };
        textStyles.fill = '#fff';

        this.batterOnStrike = new BatterBox(
            ACTION_MARGIN_W, BANNER_TOP, BANNER_WIDTH,
            (BANNER_HEIGHT / 2), textStyles, true // onStrike
        );
        this.batterOnStrike.addTo(this._two);

        this.batterNotOnStrike = new BatterBox(
            ACTION_MARGIN_W, BANNER_TOP + BANNER_HEIGHT / 2,
            BANNER_WIDTH,
            BANNER_HEIGHT / 2, textStyles);
        this.batterNotOnStrike.addTo(this._two);

        delete textStyles.fill;
        this.bowler = new Textbox(WIDTH - BANNER_FULL_WIDTH,
            BANNER_TOP, BANNER_WIDTH, BANNER_HEIGHT, 'tl', textStyles);
        this.bowler.addTo(this._two);

        // Innings score
        this.wkts = new Textbox(WIDTH / 2, HEIGHT - GRAPHICS_MARGIN_H,
            125, BANNER_HEIGHT * 0.65, 'bc', Object.assign({},
                textStyles, {
                    weight: 700,
                    bgFill: '#fff',
                    size: '1.5em',
                }));
        this.wkts.setValue('0-0');
        this.wkts.addTo(this._two);

        // EBU margins
        this.actionSafeArea = this._two.makeRectangle(WIDTH / 2, HEIGHT / 2,
            WIDTH - (2 * ACTION_MARGIN_W), HEIGHT - (2 *
                ACTION_MARGIN_H));
        this.actionSafeArea.fill = 'none';
        this.actionSafeArea.stroke = '#00958e';

        this.graphicsSafeArea = this._two.makeRectangle(WIDTH / 2, HEIGHT /
            2, WIDTH - (2 * GRAPHICS_MARGIN_W), HEIGHT - (2 *
                GRAPHICS_MARGIN_H));
        this.graphicsSafeArea.fill = 'none';
        this.graphicsSafeArea.stroke = '#a72b30';

        this._two.update();
    }

    update(score) {
        this.wkts.setValue(`W ${score.wickets}-${score.runs} R`);
        this.batterOnStrike.name = score.battingOrder[0]; // XXX
        this.batterOnStrike.runs = 64;
        this.batterOnStrike.balls = 118;
        this.batterNotOnStrike.name = score.battingOrder[1]; // XXX
        this.batterNotOnStrike.runs = 14;
        this.batterNotOnStrike.balls = 22;
        this.bowler.setValue(score.bowler);

        this._two.update();
    }

}

module.exports = Display;
