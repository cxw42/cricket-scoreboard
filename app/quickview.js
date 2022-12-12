// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const D3Color = require("3rdparty/d3-color.v2.min");
const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

const TextBox = require("textbox");
const Utils = require("utils");

const HOME = String.fromCodePoint(0x1f3e0); // or U+2302
const TOSS = String.fromCodePoint(0x1fa99); // coin
const POWERPLAY = String.fromCodePoint(0x24c5); // circled P
const EMDASH = String.fromCodePoint(0x2014);

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
const labelTextSize = "50%";
const powerplayTextSize = "75%";
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
            svg.rect(0, 0, w, rowY[teamRowCounts[0]]),
            svg.rect(0, rowY[teamRowCounts[0]], w, rowY[teamRowCounts[1]]),
        ];
        for (const [i, team] of this.battingTeams.entries()) {
            const lighter = this.battingTeams[i].color;
            const darker = D3Color.color(lighter).darker();
            const gradient = svg.gradient(
                `l(0,0,0,1)${lighter}-${lighter}:50-${darker}`
            );
            backgrounds[i].attr({
                fill: gradient,
            });
        }
        this.group.add(backgrounds);

        this.teamGroups = [];
        for (const [i, team] of this.battingTeams.entries()) {
            const y = rowY[teamRows[i]];
            const textColor = this.getTextColor(team.color);

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

        /*
        // Outline around the current team
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
        */
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

    addIcon(svg, g, x, text) {
        let icon = new TextBox(svg, x, cy, rowHeight, rowHeight, "ml", [
            {
                text,
                styles: iconStyles,
            },
        ]);
        icon.addTo(g);
    }

    makeBattingScore(svg, g, textColor) {
        let score = new TextBox(
            svg,
            w - margin,
            cy,
            w - scoreX,
            rowHeight,
            "mr",
            [
                {
                    text: "W",
                    styles: Utils.extend(textStyles, {
                        fill: textColor,
                        "font-size": labelTextSize,
                    }),
                },
                {
                    text: "9-456",
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
            ]
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
        let score = new TextBox(
            svg,
            w - margin,
            cy,
            w - scoreX,
            rowHeight,
            "mr",
            [
                {
                    text: runsStr,
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
            margin,
            rowY[durationRow] + cy,
            rowHeight,
            rowHeight,
            "ml",
            [
                {
                    // powerplay
                    text: POWERPLAY,
                    styles: Utils.extend(styles, {
                        "font-size": powerplayTextSize,
                    }),
                },
                {
                    // powerplay number
                    text: "3",
                    styles: Utils.extend(styles, {
                        "font-size": powerplayTextSize,
                    }),
                },
            ]
        );
        this.powerplay.addTo(g);

        this.duration = new TextBox(
            svg,
            w - margin,
            rowY[durationRow] + cy,
            w,
            rowHeight,
            "mr",
            [
                {
                    text: "OVERS ",
                    styles: Utils.extend(styles, {
                        "font-size": labelTextSize,
                    }),
                },
                {
                    // completed overs
                    text: "37",
                    styles: Utils.extend(styles, {}),
                },
                {
                    text: " OF ",
                    styles: Utils.extend(styles, {
                        "font-size": labelTextSize,
                    }),
                },
                {
                    // total overs
                    text: "50",
                    styles: Utils.extend(styles, {}),
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
