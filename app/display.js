// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

Two = require('two.js');
Snap = require('snapsvg');

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
    svg = null; // note: brunch doesn't do `#private`
    _team1;
    _team2;

    constructor(parentElement, team1, team2) {
        this._team1 = team1;
        this._team2 = team2;

        // Thanks to https://jsfiddle.net/x5qf7bz4/
        let svg = this.svg = Snap(WIDTH, HEIGHT);
        document.getElementById('container').appendChild(this.svg.node);
        this.svg.node.id = 'disp'; // for convenience in debugging

        // Background
        svg.rect(0, 0, '100%', '100%').attr({
            fill: '#ddd'
        });

        // Background image
        this._bg = svg.image('/slc-sample.png', 0, 0, '100%', '100%')

        // Color backgrounds
        this._team1Banner = svg.rect(0, BANNER_TOP, BANNER_FULL_WIDTH,
            BANNER_HEIGHT);
        this._team1Banner.attr({
            fill: team1.color,
            stroke: 'none',
        });

        this._team2Banner = svg.rect(WIDTH - BANNER_FULL_WIDTH, BANNER_TOP,
            BANNER_FULL_WIDTH, BANNER_HEIGHT);
        this._team2Banner.attr({
            fill: team2.color,
            stroke: 'none',
        });

        // Players' names
        let textStyles = {
            'font-family': "'Atkinson Hyperlegible', Rubik, sans-serif",
            'font-style': 'oblique',
            weight: 700,
            size: '0.9em',
            'letter-spacing': '1', // empirical
            fill: '#fff', // XXX
        };

        this.batterOnStrike = new BatterBox(svg,
            ACTION_MARGIN_W, BANNER_TOP, BANNER_WIDTH,
            (BANNER_HEIGHT / 2), textStyles, true // onStrike
        );

        this.batterNotOnStrike = new BatterBox(svg,
            ACTION_MARGIN_W, BANNER_TOP + BANNER_HEIGHT / 2,
            BANNER_WIDTH,
            BANNER_HEIGHT / 2, textStyles);

        /*
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
        */
    }

    update(score) {
        //this.wkts.setValue(`W ${score.wickets}-${score.runs} R`);
        this.batterOnStrike.name = score.battingOrder[0]; // XXX
        this.batterOnStrike.runs = 64;
        this.batterOnStrike.balls = 118;
        this.batterNotOnStrike.name = score.battingOrder[1]; // XXX
        this.batterNotOnStrike.runs = 14;
        this.batterNotOnStrike.balls = 22;
        //this.bowler.setValue(score.bowler);
    }

}

module.exports = Display;
