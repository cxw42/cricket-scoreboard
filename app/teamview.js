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
// Grid: vertical
const ROW_HEIGHT = 30;
const MARGIN = 2;
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
const tossX = MARGIN + ROW_HEIGHT;
const nameX = MARGIN + ROW_HEIGHT * 2;
const COL_X = [...Array(NCOLS + 1).keys()].map(
    (i) => MARGIN + (COL_WIDTH + MARGIN) * i
);

// TODO replace this with the native width of the score, plus padding
const scoreX = MARGIN + ROW_HEIGHT * 4.1;

/**
 * Teams and score
 *
 * @class TeamView
 */
class TeamView extends Shape {
    battingTeams = [];
    bg = null;

    constructor(
        svg,
        x,
        y,
        corner,
        teamBattingFirst,
        teamBattingSecond,
        whichTeams
    ) {
        super(svg, x, y, FULL_WIDTH, FULL_HEIGHT, corner);

        // Decide where things go
        const { home, toss, battingNow } = whichTeams;
        this.battingTeams = [teamBattingFirst, teamBattingSecond];

        let styles = Utils.extend(Styles.textStyles, {
            fill: "#000",
        });

        // Where the boxes are
        let battingTeamIdx, fieldingTeamIdx;
        if (teamBattingFirst === battingNow) {
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
        //    this.battingTeams[battingTeamIdx].color
        //);

        // Backgrounds for the rows
        let backgrounds = [];
        for (const [i, team] of this.battingTeams.entries()) {
            const lighter = this.battingTeams[i].color;
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
        let vs = (this.vs = new TextBox(
            svg,
            FULL_WIDTH / 2,
            FULL_HEIGHT / 2,
            FULL_WIDTH * 0.3,
            FULL_HEIGHT * 0.3,
            "mc",
            [
                {
                    text: "VS.",
                    styles: Styles.scoreStyles, //Utils.extend(styles, {
                    //"font-size": Styles.labelTextSize,
                    //}),
                },
            ],
            {
                background: {
                    fill: "#fff",
                    stroke: "#000",
                },
            }
        ));
        vs.svgOutline.attr({
            ry: vs.bbox.h / 2,
            rx: vs.bbox.h / 2, // same as rx
        });
        vs.addTo(this.group);

        /*************
        this.teamGroups = [];
        for (const [i, team] of this.battingTeams.entries()) {
            const y = ROW_Y[teamRows[i]];
            const textColor = Utils.getContrastingTextColor(team.color);

            // Group to hold this team's items, except for the background.
            let g = svg.g();
            Utils.freeTransformTo(g, 0, y);
            this.teamGroups.push(g);
            this.group.add(g);

            if (team == home) {
                this.addIcon(svg, g, homeX, HOME);
            }

            if (team == toss) {
                this.addIcon(svg, g, tossX, TOSS);
            }

            // Team's name (abbreviated)
            let teamAbbr = new TextBox(
                svg,
                nameX,
                0, //cy,
                WIDTH - nameX,
                ROW_HEIGHT,
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
            teamAbbr.addTo(g);

            if (i == battingTeamIdx) {
                this.makeBattingScore(svg, g, textColor);
            } else {
                // Bowling team: if it's still the first innings, show "---"
                // for the number of runs.
                this.showRuns(svg, g, textColor, i == 1 ? EMDASH : "123");
            }
        }

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

    addIcon(svg, g, x, text) {
        let icon = new TextBox(svg, x, cy, ROW_HEIGHT, ROW_HEIGHT, "ml", [
            {
                text,
                styles: Styles.iconStyles,
            },
        ]);
        icon.addTo(g);
    }

    makeBattingScore(svg, g, scoreColor) {
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
            WIDTH - MARGIN,
            cy,
            WIDTH - scoreX,
            ROW_HEIGHT,
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
        score.addTo(g);
    }

    /**
     * @method showRuns
     * @param {string} runsStr The runs, as a string.
     */
    showRuns(svg, g, textColor, runsStr) {
        const baseStyles = Utils.extend(Styles.textStyles, Styles.scoreStyles);
        let score = new TextBox(
            svg,
            WIDTH - MARGIN,
            cy,
            WIDTH - scoreX,
            ROW_HEIGHT,
            "mr",
            [
                {
                    text: runsStr,
                    styles: Utils.extend(baseStyles, {
                        fill: textColor,
                        class: "inningsFigures",
                    }),
                },
                {
                    text: "R",
                    styles: Utils.extend(baseStyles, {
                        fill: textColor,
                        "font-size": Styles.labelTextSize,
                    }),
                },
            ]
        );
        score.group.attr({
            class: "battingScore",
        });
        score.addTo(g);
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
            WIDTH - MARGIN,
            ROW_Y[durationRow] + cy,
            WIDTH,
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

module.exports = TeamView;
