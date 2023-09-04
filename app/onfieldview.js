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

// Vertical layout
const ROW_HEIGHT = 20;
const MARKER_ROW_HEIGHT = ROW_HEIGHT * 0.8;
const MARKER_HEIGHT = ROW_HEIGHT * 0.65;
const MARKER_Y_CENTER = MARGIN + 2 * ROW_HEIGHT + MARKER_ROW_HEIGHT / 2;
const NROWS = 3; // batter 1, batter 2, gap, bowler
const FULL_HEIGHT = NROWS * ROW_HEIGHT + 2 * MARGIN + MARKER_ROW_HEIGHT;

/**
 * Batters and bowlers on the field.  The layout is:
 *
 * - margin
 * - Batter on strike
 * - Batter not on strike
 * - gap with "On field" lozenge in it
 * - Bowler
 * - margin
 *
 * @class OnFieldView
 * @constructor
 * @param {Snap} svg SVG surface (see {{#crossLink "Shape"}}{{/crossLink}})
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {String} corner Corner
 * @param {int} rowHeight Row height --- **not** whole-box height!
 * @param {Object} situation The current situation
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
        situation,
        textStyles = {},
        opts = {}
    ) {
        const teamColors = [situation.teams[0].color, situation.teams[1].color];
        const gap = 0.125; // percent of a row's height

        super(svg, x, y, w, FULL_HEIGHT, corner);
        // Overall background
        {
            const lighter = "#ccc";
            const darker = D3Color.color(lighter).darker();
            const gradient = svg.gradient(
                `l(0,0,0,1)${lighter}-${lighter}:50-${darker}`
            );
            this.bg = new Rect(svg, 0, 0, w + MARGIN, FULL_HEIGHT, "tl", {
                background: {
                    fill: gradient,
                },
            });
            this.bg.addTo(this.group);
        }

        // Backgrounds for the rows
        this.bgBatting = this.makeGradientRect(
            teamColors[0],
            MARGIN,
            2 * ROW_HEIGHT + MARKER_ROW_HEIGHT / 2 - MARGIN
        );
        this.bgBatting.addTo(this);
        this.bgBowling = this.makeGradientRect(
            teamColors[1],
            2 * ROW_HEIGHT + MARKER_ROW_HEIGHT / 2 + MARGIN,
            ROW_HEIGHT + MARKER_ROW_HEIGHT / 2
        );
        this.bgBowling.addTo(this);

        // Batters
        this.batterOnStrike = new BatterBox2(
            svg,
            MARGIN,
            MARGIN,
            w - MARGIN,
            ROW_HEIGHT,
            "tl",
            Utils.extend(textStyles, {
                teamColor: teamColors[0],
            })
        );
        this.batterOnStrike.addTo(this);

        this.batterNotOnStrike = new BatterBox2(
            svg,
            MARGIN,
            MARGIN + ROW_HEIGHT,
            w - MARGIN,
            ROW_HEIGHT,
            "tl",
            Utils.extend(textStyles, {
                teamColor: teamColors[0],
            })
        );
        this.batterNotOnStrike.addTo(this);

        // Label
        {
            const lighter = "#ccc";
            const darker = D3Color.color(lighter).darker();
            const gradient = svg.gradient(
                `l(0,0,0,1)${lighter}-${lighter}:50-${darker}`
            );
            this.label = new TextBox(
                svg,
                MARGIN + 11,
                MARKER_Y_CENTER,
                55,
                MARKER_HEIGHT,
                "ml",
                [
                    {
                        text: "In the Middle",
                        styles: Utils.extend(Styles.scoreStyles, {
                            "font-size": "12px",
                            "letter-spacing":
                                Styles.textStyles["letter-spacing"],
                            "font-variant": "small-caps",
                        }),
                    },
                ],
                {
                    alignment: "c",
                    background: {
                        fill: gradient,
                    },
                }
            );
            this.label.svgOutline.attr({
                ry: this.label.bbox.h / 2,
                rx: this.label.bbox.h / 2, // same as rx
            });
            this.label.addTo(this);
        }

        // Bowler
        this.bowler = new BowlerBox2(
            svg,
            MARGIN,
            MARKER_Y_CENTER + MARKER_ROW_HEIGHT / 2,
            w - MARGIN,
            ROW_HEIGHT,
            "tl",
            Utils.extend(textStyles, {
                teamColor: teamColors[1],
            })
        );
        this.bowler.addTo(this);

        this.update(situation);
    } // ctor

    makeGradientRect(color, y, h) {
        const darker = D3Color.color(color).darker();
        const gradient = this.svg.gradient(
            `l(0,0,0,1)${color}-${color}:50-${darker}`
        );
        let bg = new Rect(this.svg, MARGIN, y, this.bbox.w - MARGIN, h, "tl", {
            background: {
                fill: gradient,
            },
        });
        return bg;
    }

    update(situation) {
        this.batterOnStrike.name = situation.batters[situation.onStrikeIdx];
        this.batterOnStrike.runs = situation.batterRuns[situation.onStrikeIdx];
        this.batterOnStrike.balls =
            situation.batterBalls[situation.onStrikeIdx];
        this.batterNotOnStrike.name =
            situation.batters[1 - situation.onStrikeIdx];
        this.batterNotOnStrike.runs =
            situation.batterRuns[1 - situation.onStrikeIdx];
        this.batterNotOnStrike.balls =
            situation.batterBalls[1 - situation.onStrikeIdx];
        this.bowler.name = situation.bowler;
        this.bowler.runs = situation.bowlerRuns;
        this.bowler.wickets = situation.bowlerWickets;
        this.bowler.overs = situation.bowlerCompleteOvers;
    }
}

module.exports = OnFieldView;
