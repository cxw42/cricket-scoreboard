// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

const TextBox = require("textbox");
const Utils = require("utils");

const HOME = String.fromCodePoint(0x1f3e0); // or U+2302
const TOSS = String.fromCodePoint(0x1fa99);

// Basic text style
const textStyles = {
    "font-family": "Rubik, 'Atkinson Hyperlegible', sans-serif",
    "font-style": "oblique",
    weight: 700,
    size: "0.9em",
    "letter-spacing": "1", // empirical
    fill: "#fff", // XXX
};
const iconStyles = Utils.extend(textStyles, {
    "font-style": "normal",
    "font-size": "0.75em",
});
const labelTextSize = "75%"; // from BowlerBox
const scoreTextSize = "x-large";

// Grid: vertical
const rowHeight = 20;
const cy = rowHeight / 2;
const margin = 2;
const nrows = 3;
const rowY = [...Array(nrows + 1).keys()].map((i) => (rowHeight + margin) * i);

// Grid: horizontal
const w = 150;
const homeX = margin;
const tossX = margin + rowHeight;
const nameX = margin + rowHeight * 2;
const scoreX = margin + rowHeight * 4.5;

/**
 * Innings situation
 *
 * @class QuickView
 */
class QuickView {
    svg = null; // note: brunch doesn't do `#private`
    battingTeams = [];

    constructor(svg, x, y, teamBattingFirst, teamBattingSecond, whichTeams) {
        const { home, toss, battingNow } = whichTeams;
        this.svg = svg;
        this.battingTeams = [teamBattingFirst, teamBattingSecond];

        this.group = svg.g();
        Utils.freeTransformTo(this.group, x, y);

        /*
        // DEBUG
        this.bg = svg.rect(0, 0, w, rowY[nrows]);
        this.bg.attr({
            stroke: "none",
            fill: "#ddd",
        });
        this.group.add(this.bg);
        */

        let styles = Utils.extend(textStyles, {
            fill: "#000",
        });

        // Where the boxes are
        let battingTeam, teamRows, durationRow, activeRowStart, teamRowCounts;
        if (teamBattingFirst === battingNow) {
            battingTeam = 0;
            durationRow = 0;
            activeRowStart = 0;
            teamRows = [1, 2];
            teamRowCounts = [2, 1];
        } else {
            battingTeam = 1;
            teamRows = [0, 1];
            activeRowStart = 1;
            durationRow = 2;
            teamRowCounts = [1, 2];
        }

        const durationColor = this.getTextColor(
            this.battingTeams[battingTeam].color
        );

        // Backgrounds.  TODO include margin
        let backgrounds = [
            svg.rect(0, 0, w, teamRowCounts[0] * rowHeight),
            svg.rect(
                0,
                teamRowCounts[0] * rowHeight,
                w,
                teamRowCounts[1] * rowHeight
            ),
        ];
        backgrounds[0].attr({
            fill: this.battingTeams[0].color,
        });
        backgrounds[1].attr({
            fill: this.battingTeams[1].color,
        });
        this.group.add(backgrounds);

        this.teamGroups = [];
        for (const [i, team] of this.battingTeams.entries()) {
            const y = rowY[teamRows[i]];
            const textColor = this.getTextColor(team.color);

            let g = svg.g();
            Utils.freeTransformTo(g, 0, y);
            this.teamGroups.push(g);
            this.group.add(g);

            /*
            // TODO duration shares a background with the score row
            let bg = svg.rect(0, 0, w, rowHeight);
            g.attr({
                fill: this.battingTeams[i].color,
            });
            g.add(bg);
            */

            if (team == home) {
                let homeIcon = new TextBox(
                    svg,
                    homeX,
                    cy,
                    rowHeight,
                    rowHeight,
                    "ml",
                    [
                        {
                            text: HOME,
                            styles: iconStyles,
                        },
                    ]
                );
                homeIcon.addTo(g);
            }

            if (team == toss) {
                let tossIcon = new TextBox(
                    svg,
                    tossX,
                    cy,
                    rowHeight,
                    rowHeight,
                    "ml",
                    [
                        {
                            text: TOSS,
                            styles: iconStyles,
                        },
                    ]
                );
                tossIcon.addTo(g);
            }

            let teamAbbr = new TextBox(
                svg,
                nameX,
                cy,
                w - nameX,
                rowHeight,
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

            if (i == battingTeam) {
                this.makeBattingScore(svg, g, textColor);
            } else if (i == 0) {
                this.showTotalIfAny(svg, g, textColor);
            }
        }

        // Current overs
        this.duration = this.makeDuration(
            svg,
            this.group,
            durationRow,
            Utils.extend(styles, { fill: durationColor })
        );

        this.currentTeamMarker = svg.rect(
            0,
            rowY[activeRowStart],
            w,
            rowHeight * 2
        );
        this.currentTeamMarker.attr({
            stroke: "#ff0",
            fill: "none",
        });
        this.group.add(this.currentTeamMarker);
    } // ctor

    /**
     * Return a text color contrasting with the given color
     *
     * @method getTextColor
     * @param {string} color The color, as a hex string, e.g., `#123456`.
     */
    getTextColor(color) {
        if (WcagContrast.hex(color, "#000") > WcagContrast.hex(color, "#fff")) {
            return "#000";
        } else {
            return "#fff";
        }
    }

    makeBattingScore(svg, g, textColor) {
        let score = new TextBox(svg, scoreX, cy, w - scoreX, rowHeight, "ml", [
            {
                text: "W",
                styles: Utils.extend(textStyles, {
                    fill: textColor,
                    "font-size": labelTextSize,
                }),
            },
            {
                text: "0-0",
                styles: Utils.extend(textStyles, {
                    fill: textColor,
                    class: "inningsFigures",
                }),
            },
            {
                text: "R",
                styles: Utils.extend(textStyles, {
                    fill: textColor,
                    "font-size": labelTextSize,
                }),
            },
        ]);
        score.group.attr({
            class: "battingScore",
        });
        score.addTo(g);
    }

    showTotalIfAny(svg, g, textColor) {
        let score = new TextBox(svg, scoreX, cy, w - scoreX, rowHeight, "ml", [
            {
                text: "123",
                styles: Utils.extend(textStyles, {
                    fill: textColor,
                    class: "inningsFigures",
                }),
            },
            {
                text: "R",
                styles: Utils.extend(textStyles, {
                    fill: textColor,
                    "font-size": labelTextSize,
                }),
            },
        ]);
        score.group.attr({
            class: "battingScore",
        });
        score.addTo(g);
    }

    makeDuration(svg, g, durationRow, styles) {
        this.duration = new TextBox(
            svg,
            w - margin,
            rowY[durationRow] + cy,
            w,
            rowHeight,
            "mr",
            [
                {
                    // powerplay
                    text: "P3   ",
                    styles: Utils.extend(styles, {
                        "font-size": labelTextSize,
                    }),
                },
                {
                    // completed overs
                    text: "42",
                    styles: Utils.extend(styles, {}),
                },
                {
                    text: "o",
                    styles: Utils.extend(styles, {
                        "font-size": labelTextSize,
                    }),
                },
                {
                    // balls so far in this over
                    text: "1",
                    styles: Utils.extend(styles, {}),
                },
                {
                    text: "B",
                    styles: Utils.extend(styles, {
                        "font-size": labelTextSize,
                    }),
                },
                {
                    // duration of match, for limited-overs matches.  TODO.
                    text: "/50o",
                    styles: Utils.extend(styles, {
                        "font-size": labelTextSize,
                    }),
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

module.exports = QuickView;
