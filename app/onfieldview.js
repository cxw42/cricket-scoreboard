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
    constructor(svg, x, y, w, corner, rowHeight, teamColors, textStyles = {}, opts = {}) {

        const gap = 0.125; // percent of a row's height
        const h = rowHeight * 4 + gap * 2;

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
            text: "On field", styles: textStyles,
        });
        this.label.addTo(this);

        // Batters
        this.batterOnStrike = new BatterBox2(svg, 0,
            rowHeight*(1+gap), w, rowHeight, 'tl',
            Utils.extend(textStyles, {
                teamColor: teamColors[0]
            }));
        this.batterOnStrike.addTo(this);

        this.batterNotOnStrike = new BatterBox2(svg, 0,
            rowHeight*(1+gap+1), w, rowHeight, 'tl',
            Utils.extend(textStyles, {
                teamColor: teamColors[0],
            }));
        this.batterNotOnStrike.addTo(this);

        // Bowler
        this.bowler = new BowlerBox2(
            svg, 0,
            rowHeight*(1+gap+1+1+gap), w, rowHeight, 'tl',
            Utils.extend(textStyles, {
                teamColor: teamColors[1],
            }));
        this.bowler.addTo(this);


        return; // XXX
        for (const [i, color] of teamColors) {
            const lighter = color;
            const darker = D3Color.color(lighter).darker();
            const gradient = svg.gradient(
                `l(0,0,0,1)${lighter}-${lighter}:50-${darker}`
            );
            let bg = new Rect(
                svg,
                COL_X[0],
                ROW_Y[i],
                COL_WIDTH,
                ROW_HEIGHT,
                "tl",
                {
                    background: {
                        fill: gradient,
                    },
                }
            );
            bg.addTo(this.group);
            backgrounds.push(bg);
        }

        // "Vs." marker
        {
            const lighter = "#ccc";
            const darker = D3Color.color(lighter).darker();
            const gradient = svg.gradient(
                `l(0,0,0,1)${lighter}-${lighter}:50-${darker}`
            );
            let vs = (this.vs = new TextBox(
                svg,
                nameX + 11, // TODO permit centering text even when corner=="ml"
                FULL_HEIGHT / 2,
                FULL_WIDTH * 0.25,
                FULL_HEIGHT * 0.25,
                "mc",
                [
                    {
                        text: "VS.",
                        styles: Utils.extend(Styles.scoreStyles, {
                            "font-size": "12px",
                        }),
                    },
                ],
                {
                    background: {
                        fill: gradient,
                        //stroke: "#000",
                    },
                }
            ));
            vs.svgOutline.attr({
                ry: vs.bbox.h / 2,
                rx: vs.bbox.h / 2, // same as rx
            });
            vs.addTo(this.group);
        }

        this.teamGroups = [];
        for (const [i, team] of this.battingTeams.entries()) {
            // Team batting first aligns at the top; team batting second
            // aligns at the bottom.
            const y = ROW_Y[i] + (i == 0 ? MARGIN : ROW_HEIGHT - MARGIN);
            const corner = i == 0 ? "tl" : "bl";

            const textColor = Utils.getContrastingTextColor(team.color);

            // Group to hold this team's items, except for the background.
            let sh = new Shape(
                svg,
                0,
                y,
                COL_WIDTH,
                (ROW_HEIGHT * 2) / 3,
                corner
            );
            this.teamGroups.push(sh);
            sh.addTo(this.group);

            if (team == home) {
                this.addIcon(svg, sh, homeX, HOME);
            }

            if (team == toss) {
                this.addIcon(svg, sh, tossX, TOSS);
            }

            // Team's name (abbreviated)
            let teamAbbr = new TextBox(
                svg,
                nameX,
                sh.bbox.h / 2,
                sh.bbox.w - nameX,
                sh.bbox.h,
                "ml",
                [
                    {
                        text: team.abbrev,
                        styles: Utils.extend(styles, {
                            fill: textColor,
                        }),
                    },
                ]
            );
            teamAbbr.addTo(sh.group);

            if (i == battingTeamIdx) {
                this.makeBattingScore(svg, sh, textColor);
            } else {
                // Bowling team: if it's still the first innings, show "---"
                // for the number of runs.
                this.showRuns(svg, sh, textColor, i == 1 ? EMDASH : "123");
            }
        }

        /*************
        // Current overs
        this.duration = this.makeDuration(
            svg,
            this.group,
            durationRow,
            Utils.extend(styles, {
                fill: durationColor,
                "font-style": "normal",
            })
        );

        *********/
        /*
        // Outline around the current team
        this.currentTeamMarker = svg.rect(
            0,
            ROW_Y[activeRowStart],
            WIDTH,
            ROW_HEIGHT * 2
        );
        this.currentTeamMarker.attr({
            stroke: "#ff0",
            fill: "none",
        });
        this.group.add(this.currentTeamMarker);
        */
    } // ctor

    addIcon(svg, sh, x, text) {
        let icon = new TextBox(
            svg,
            x,
            sh.bbox.h / 2,
            sh.bbox.h,
            sh.bbox.h,
            "ml",
            [
                {
                    text,
                    styles: Styles.iconStyles,
                },
            ]
        );
        icon.addTo(sh.group);
    }

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

    makeBattingScore(svg, sh, scoreColor) {
        /*
        // TODO figure out a better way to make the scores pop out.  Maybe
        // always dark text on yellow BG?
        const boxColor =
            WcagContrast.hex(scoreColor, gray9) >
            WcagContrast.hex(scoreColor, gray36)
                ? gray9
                : gray36;
        */

        const boxColorLight = "#fff8b4";
        //const boxColorDark = '#fff602';

        scoreColor = "black"; //gray9;
        const boxColor = boxColorLight;

        const baseStyles = Utils.extend(Styles.textStyles, Styles.scoreStyles);

        let score = new TextBox(
            svg,
            sh.bbox.w,
            sh.bbox.h / 2,
            sh.bbox.w - scoreX,
            sh.bbox.h,
            "mr",
            [
                {
                    text: "R",
                    styles: Utils.extend(baseStyles, {
                        fill: scoreColor,
                        "font-size": Styles.labelTextSize,
                    }),
                },
                {
                    text: "456-9",
                    styles: Utils.extend(baseStyles, {
                        fill: scoreColor,
                        class: "inningsFigures",
                        "font-weight": "bold",
                    }),
                },
                {
                    text: "W",
                    styles: Utils.extend(baseStyles, {
                        fill: scoreColor,
                        "font-size": Styles.labelTextSize,
                    }),
                },
            ],
            {
                background: {
                    stroke: boxColor, // scoreColor
                    fill: boxColor,
                    rx: MARGIN,
                },
            }
        );
        score.group.attr({
            class: "battingScore",
        });
        score.addTo(sh.group);
    }

    /**
     * @method showRuns
     * @param {string} runsStr The runs, as a string.
     */
    showRuns(svg, sh, textColor, runsStr) {
        const baseStyles = Utils.extend(Styles.textStyles, Styles.scoreStyles);
        let score = new TextBox(
            svg,
            sh.bbox.w,
            sh.bbox.h / 2,
            sh.bbox.w - scoreX,
            sh.bbox.h,
            "mr",
            [
                {
                    text: "R",
                    styles: Utils.extend(baseStyles, {
                        fill: textColor,
                        "font-size": Styles.labelTextSize,
                    }),
                },
                {
                    text: runsStr,
                    styles: Utils.extend(baseStyles, {
                        fill: textColor,
                        class: "inningsFigures",
                    }),
                },
            ]
        );
        score.group.attr({
            class: "battingScore",
        });
        score.addTo(sh.group);
    }

    makeDuration(svg, g, durationRow, styles) {
        this.powerplay = new TextBox(
            svg,
            MARGIN,
            ROW_Y[durationRow] + cy,
            ROW_HEIGHT,
            ROW_HEIGHT,
            "ml",
            [
                {
                    // powerplay
                    text: POWERPLAY,
                    styles: Utils.extend(styles, {
                        "font-size": Styles.powerplayTextSize,
                    }),
                },
                {
                    // powerplay number
                    text: "3",
                    styles: Utils.extend(styles, {
                        "font-size": Styles.powerplayTextSize,
                    }),
                },
            ]
        );
        this.powerplay.addTo(g);

        this.duration = new TextBox(
            svg,
            COL_WIDTH - MARGIN,
            ROW_Y[durationRow] + cy,
            COL_WIDTH,
            ROW_HEIGHT,
            "mr",
            [
                {
                    text: "OVERS ",
                    styles: Utils.extend(styles, {
                        "font-size": Styles.labelTextSize,
                    }),
                },
                {
                    // completed overs
                    text: "37",
                    styles: Utils.extend(
                        styles,
                        {
                            "font-size": Styles.powerplayTextSize,
                        },
                        Styles.numberStyles
                    ),
                },
                {
                    text: " OF ",
                    styles: Utils.extend(styles, {
                        "font-size": Styles.labelTextSize,
                    }),
                },
                {
                    // total overs
                    text: "50",
                    styles: Utils.extend(
                        styles,
                        {
                            "font-size": Styles.powerplayTextSize,
                        },
                        Styles.numberStyles
                    ),
                },
            ]
        );
        this.duration.addTo(g);
    }

    update(score) {
        return; // XXX
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