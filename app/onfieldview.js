// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const D3Color = require("3rdparty/d3-color.v2.min");
const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

const BatterBox2 = require("batterbox2");
const BowlerBox2 = require("bowlerbox2");
const Rect = require("rect");
const Shape = require("shape");
const Styles = require("styles");
const TextBox = require("textbox");
const Utils = require("utils");

const HOME = String.fromCodePoint(0x1f3e0); // or U+2302
const TOSS = String.fromCodePoint(0x1fa99); // coin
const POWERPLAY = String.fromCodePoint(0x24c5); // circled P
const EMDASH = String.fromCodePoint(0x2014);

// Layout is margin around, plus margin between individual rows
const MARGIN = 2;
// TODO padding

// Grid: vertical
const ROW_HEIGHT = 30;
const NROWS = 2;
const FULL_HEIGHT = NROWS * (MARGIN + ROW_HEIGHT) + MARGIN;
const ROW_Y = [...Array(NROWS + 1).keys()].map(
    (i) => MARGIN + (ROW_HEIGHT + MARGIN) * i
);

// Grid: horizontal
const NCOLS = 1;
const COL_WIDTH = 150;
const FULL_WIDTH = NCOLS * (MARGIN + COL_WIDTH) + MARGIN;
const homeX = MARGIN;
const tossX = MARGIN + 20;
const nameX = MARGIN + 20 * 2;
const COL_X = [...Array(NCOLS + 1).keys()].map(
    (i) => MARGIN + (COL_WIDTH + MARGIN) * i
);

// TODO replace this with the native width of the score, plus padding
const scoreX = 85;

/**
 * Batters and bowlers on the field.  The layout is:
 *
 * - "On field" label
 * - gap
 * - Batter on strike
 * - Batter not on strike
 * - gap
 * - Bowler
 *
 * @class OnFieldView
 * @constructor
 * @param {Snap} svg SVG surface (see {{#crossLink "Shape"}}{{/crossLink}})
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {String} corner Corner
 * @param {int} rowHeight Row height --- **not** whole-box height!
 * @param {Array} teamColors Colors for each team (batting, then bowling).
 * @param {Object} [textStyles] Text styles
 * @param {Object} [opts] Options
 */
class OnFieldView extends Shape {
    constructor(
        svg,
        x,
        y,
        w,
        corner,
        rowHeight,
        teamColors,
        textStyles = {},
        opts = {}
    ) {
        const gap = 0.125; // percent of a row's height
        const h = rowHeight * (4 + gap * 2);

        super(svg, x, y, w, h, corner);
        // Overall background
        {
            const lighter = "#ccc";
            const darker = D3Color.color(lighter).darker();
            const gradient = svg.gradient(
                `l(0,0,0,1)${lighter}-${lighter}:50-${darker}`
            );
            this.bg = new Rect(svg, 0, 0, w, h, "tl", {
                background: {
                    fill: gradient,
                },
            });
            this.bg.addTo(this.group);
        }

        // Backgrounds for the rows
        this.bgBatting = this.makeGradientRect(
            teamColors[0],
            rowHeight * (1 + gap),
            2 * rowHeight
        );
        this.bgBatting.addTo(this);
        this.bgBowling = this.makeGradientRect(
            teamColors[1],
            rowHeight * (1 + gap + 2 + gap),
            rowHeight
        );
        this.bgBowling.addTo(this);

        // Label
        this.label = new TextBox(svg, 0, 0, w, rowHeight, "tl", {
            text: "On field",
            styles: Utils.extend(textStyles, { fill: "#000" }),
        });
        this.label.addTo(this);

        // Batters
        this.batterOnStrike = new BatterBox2(
            svg,
            0,
            rowHeight * (1 + gap),
            w,
            rowHeight,
            "tl",
            Utils.extend(textStyles, {
                teamColor: teamColors[0],
            })
        );
        this.batterOnStrike.addTo(this);

        this.batterNotOnStrike = new BatterBox2(
            svg,
            0,
            rowHeight * (1 + gap + 1),
            w,
            rowHeight,
            "tl",
            Utils.extend(textStyles, {
                teamColor: teamColors[0],
            })
        );
        this.batterNotOnStrike.addTo(this);

        // Bowler
        this.bowler = new BowlerBox2(
            svg,
            0,
            rowHeight * (1 + gap + 1 + 1 + gap),
            w,
            rowHeight,
            "tl",
            Utils.extend(textStyles, {
                teamColor: teamColors[1],
            })
        );
        this.bowler.addTo(this);
    } // ctor

    makeGradientRect(color, y, h) {
        const darker = D3Color.color(color).darker();
        const gradient = this.svg.gradient(
            `l(0,0,0,1)${color}-${color}:50-${darker}`
        );
        let bg = new Rect(this.svg, 0, y, this.bbox.w, h, "tl", {
            background: {
                fill: gradient,
            },
        });
        return bg;
    }

    update(score) {
        return; // TODO RESUME HERE
        this.batterOnStrike.name = score.battingOrder[0]; // XXX
        this.batterOnStrike.runs = 64;
        this.batterOnStrike.balls = 118;
        this.batterNotOnStrike.name = score.battingOrder[1]; // XXX
        this.batterNotOnStrike.runs = 14;
        this.batterNotOnStrike.balls = 22;
        this.bowler.name = score.bowler;
        this.bowler.wickets = 1;
        this.bowler.runs = 43;
        this.bowler.balls = 12 * 6 + 2; // 12.2 ov.
    }
}

module.exports = OnFieldView;
