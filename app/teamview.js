// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const D3Color = require("3rdparty/d3-color.v2.min");
const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

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
 * Teams and score
 *
 * @class TeamView
 */
class TeamView extends Shape {
    teams = [];
    bg = null;

    constructor(svg, x, y, corner, situation) {
        super(svg, x, y, FULL_WIDTH, FULL_HEIGHT, corner);

        // Decide where things go
        this.teams = situation.teams;

        let styles = Utils.extend(Styles.textStyles, {
            fill: "#000",
        });

        // Where the boxes are
        let battingTeamIdx, fieldingTeamIdx;
        if (this.teams[0] === situation.battingNow) {
            battingTeamIdx = 0;
        } else {
            battingTeamIdx = 1;
        }
        fieldingTeamIdx = 1 - battingTeamIdx;

        // Overall background
        {
            const lighter = "#ccc";
            const darker = D3Color.color(lighter).darker();
            const gradient = svg.gradient(
                `l(0,0,0,1)${lighter}-${lighter}:50-${darker}`
            );
            this.bg = new Rect(svg, 0, 0, FULL_WIDTH, FULL_HEIGHT, "tl", {
                background: {
                    fill: gradient,
                },
            });
            this.bg.addTo(this.group);
        }

        //const durationColor = Utils.getContrastingTextColor(
        //    this.teams[battingTeamIdx].color
        //);

        // Backgrounds for the rows
        let backgrounds = [];
        for (const [i, team] of this.teams.entries()) {
            const lighter = this.teams[i].color;
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
        for (const [i, team] of this.teams.entries()) {
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

            if (team == situation.home) {
                this.addIcon(svg, sh, homeX, HOME);
            }

            if (team == situation.toss) {
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

        this.update(situation);
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
                        "font-weight": "bold",
                    }),
                    label: "inningsFigures",
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
        this.battingScore = score;
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

    /**
     * Update the score.  Doesn't update anything else.
     *
     * @method update
     */
    update(situation) {
        this.battingScore.setValue(
            `${situation.runs}-${situation.wickets}`,
            "inningsFigures"
        );
    }
}

module.exports = TeamView;
