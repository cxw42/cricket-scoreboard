// TODO Add over X/Y to Try 1
// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

// For debugging
const SHOW_EBU_MARGINS = false;
const SHOW_SECOND_INNINGS_QUICKVIEW = false;

// Which layout we are trying
const TRY = 3;

const D3Color = require("3rdparty/d3-color.v2.min");
const Snap = require("snapsvg");

const Marker = require("rules").Marker;

const BatterBox = require("batterbox");
const BatterBox2 = require("batterbox2");
const BowlerBox = require("bowlerbox");
const CurrentOverBox = require("currentoverbox");
//const Score = require('score');
const Situation = require("situation");
//const TextBox = require('textbox');
const InningsBox = require("inningsbox");
const OnFieldView = require("onfieldview");
const QuickView = require("quickview");
const Styles = require("styles");
const TeamView = require("teamview");
const Utils = require("utils");

// DEBUG
const ScoreReadout = require("score-readout");
const TextBox = require("textbox");

// 1080p, but divided by 2 to be more visible on screen.
const SCALE = 2;
const WIDTH = 1920 / SCALE;
const HEIGHT = 1080 / SCALE;
const BANNER_WIDTH = 600 / SCALE;
const BANNER_HEIGHT = 90 / SCALE;
const NAME_BOX_WIDTH = BANNER_WIDTH * 0.7;

// Computed dimensions

// Dimensions from <https://tech.ebu.ch/docs/techreview/trev_280-baker.pdf>
const ACTION_MARGIN_W = (WIDTH * 0.035) | 0; // action-safe area, 16:9
const ACTION_MARGIN_H = (HEIGHT * 0.035) | 0;
const GRAPHICS_MARGIN_W = (WIDTH * 0.1) | 0; // graphics-safe area, 16:9
const GRAPHICS_MARGIN_H = (HEIGHT * 0.05) | 0;

const BANNER_BOTTOM = HEIGHT - ACTION_MARGIN_H;
const BANNER_TOP = BANNER_BOTTOM - BANNER_HEIGHT;
// banner extends to the edges of the screen
const BANNER_FULL_WIDTH = WIDTH / 2; //BANNER_WIDTH + ACTION_MARGIN_W;

class Display {
    _team1;
    _team2;

    constructor(parentElement, team1, team2) {
        this._team1 = team1;
        this._team2 = team2;

        // Thanks to https://jsfiddle.net/x5qf7bz4/
        let svg = Snap(WIDTH, HEIGHT);
        parentElement.getElementById("container").appendChild(svg.node);
        svg.node.id = "disp"; // for convenience in debugging

        // Background
        svg.rect(0, 0, "100%", "100%").attr({
            fill: "#ddd",
        });

        // Background image
        this._bg = svg.image("/slc-sample.png", 0, 0, "100%", "100%");

        /*
        console.log("readout1");
        this.readout1 = new ScoreReadout(svg, 150, 10, -1, -1, "tc", {
            showWickets: true,
            teamColor: "#88f",
            font: { "font-weight": "bold" },
            fontLabel: { "font-weight": "bold" },
        });
        console.log("readout1 end");
        this.readout2 = new ScoreReadout(svg, 200, 10, 100, 100, "tl", {
            showWickets: false,
            teamColor: "#000",
            background: { fill: "#444" },
            font: { fill: "#33f" },
            fontLabel: { fill: "#3f3" },
        });
        window.setTimeout(() => {
            //debugger;
            this.readout1.lineUp();
        }, 2000);
        setTimeout(() => {
            this.readout1.update(1, 4);
        }, 1000);
        setTimeout(() => {
            this.readout1.update(12, 4);
        }, 2000);
        setTimeout(() => {
            this.readout1.update(1, 4);
        }, 3000);
        setTimeout(() => {
            this.readout1.update(9999, 9999);
        }, 4000);
        this.readout2.update(456, 7);
        */

        let textStyles = Utils.extend(Styles.textStyles, {
            "letter-spacing": "1", // empirical
        });

        if (TRY == 1) {
            // Color backgrounds
            this._team1Banner = svg.rect(
                0,
                BANNER_TOP,
                BANNER_FULL_WIDTH,
                BANNER_HEIGHT
            );
            this._team1Banner.attr({
                fill: team1.color,
                stroke: "none",
            });

            this._team2Banner = svg.rect(
                WIDTH - BANNER_FULL_WIDTH,
                BANNER_TOP,
                BANNER_FULL_WIDTH,
                BANNER_HEIGHT
            );
            this._team2Banner.attr({
                fill: team2.color,
                stroke: "none",
            });

            // Players' names
            this.batterOnStrike = new BatterBox(
                svg,
                ACTION_MARGIN_W,
                BANNER_TOP,
                NAME_BOX_WIDTH,
                BANNER_HEIGHT / 2,
                textStyles,
                true // onStrike
            );

            this.batterNotOnStrike = new BatterBox(
                svg,
                ACTION_MARGIN_W,
                BANNER_TOP + BANNER_HEIGHT / 2,
                NAME_BOX_WIDTH,
                BANNER_HEIGHT / 2,
                textStyles
            );

            delete textStyles.fill;
            this.bowler = new BowlerBox(
                svg,
                WIDTH - NAME_BOX_WIDTH - ACTION_MARGIN_W,
                BANNER_TOP,
                NAME_BOX_WIDTH,
                BANNER_HEIGHT,
                textStyles
            );

            textStyles.size = "1.2em";
            this.inningScore = new InningsBox(
                svg,
                ACTION_MARGIN_W + NAME_BOX_WIDTH,
                BANNER_TOP,
                this.bowler.bbox.ulx - (ACTION_MARGIN_W + NAME_BOX_WIDTH),
                BANNER_HEIGHT,
                textStyles
            );
        } else if (TRY == 2) {
            const battingTeams = [team1, team2];
            // --- Left side ---
            // TODO: the quickview's rows are rowHeight+margin, but the rows of the
            // CurrentOverBox, BatterBox, and BowlerBox are only rowHeight.
            this.qv1 = new QuickView(
                svg,
                ACTION_MARGIN_W,
                BANNER_TOP - BANNER_HEIGHT / 2,
                team1,
                team2,
                {
                    home: team1,
                    toss: team2,
                    battingNow: team1,
                }
            );

            // DEBUG: the other team is batting
            if (SHOW_SECOND_INNINGS_QUICKVIEW) {
                this.qv2 = new QuickView(
                    svg,
                    ACTION_MARGIN_W + 200,
                    BANNER_TOP - BANNER_HEIGHT / 2,
                    team1,
                    team2,
                    {
                        home: team1,
                        toss: team2,
                        battingNow: team2,
                    }
                );
            }

            // --- Right side ---

            // Backgrounds.  TODO refactor out code in common with QuickView.
            let x = WIDTH - ACTION_MARGIN_W - NAME_BOX_WIDTH;
            let rowHeight = BANNER_HEIGHT / 2;
            let backgrounds = [
                svg.rect(
                    x,
                    BANNER_TOP - rowHeight,
                    NAME_BOX_WIDTH,
                    rowHeight * 2
                ),
                svg.rect(x, BANNER_TOP + rowHeight, NAME_BOX_WIDTH, rowHeight),
            ];
            for (const [i, team] of battingTeams.entries()) {
                const lighter = battingTeams[i].color;
                const darker = D3Color.color(lighter).darker();
                const gradient = svg.gradient(
                    `l(0,0,0,1)${lighter}-${lighter}:50-${darker}`
                );
                backgrounds[i].attr({
                    fill: gradient,
                });
            }

            this.batterOnStrike = new BatterBox(
                svg,
                x,
                BANNER_TOP - rowHeight,
                NAME_BOX_WIDTH,
                rowHeight,
                textStyles,
                true // onStrike
            );

            this.batterNotOnStrike = new BatterBox(
                svg,
                x,
                BANNER_TOP,
                NAME_BOX_WIDTH,
                rowHeight,
                textStyles
            );

            delete textStyles.fill;
            this.bowler = new BowlerBox(
                svg,
                x,
                BANNER_TOP + rowHeight,
                NAME_BOX_WIDTH,
                BANNER_HEIGHT,
                textStyles,
                { oneLineOnly: true }
            );

            // --- Center ---

            const thisOverWidth = 100;
            this.thisOver = new CurrentOverBox(
                svg,
                WIDTH / 2,
                BANNER_TOP + BANNER_HEIGHT,
                rowHeight,
                "bc"
            );

            // XXX DEBUG
            this.thisOver.recordDelivery(1);
            this.thisOver.recordDelivery(2, [Marker.WIDE]);
            this.thisOver.recordDelivery(0, [Marker.WICKET]);
            this.thisOver.recordDelivery(4);
            this.thisOver.recordDelivery(5);
            this.thisOver.recordDelivery(6);
            this.thisOver.recordDelivery(7);
            window.setTimeout(() => {
                this.thisOver.newOver();
            }, 2000);
            window.setTimeout(() => {
                this.thisOver.recordDelivery(3);
            }, 3000);
        } else if (TRY == 3) {
            let rowHeight = BANNER_HEIGHT / 2;
            let situation = new Situation(20, [team1, team2], team2);

            // Left side

            this.teamView1 = new TeamView(
                svg,
                ACTION_MARGIN_W,
                BANNER_BOTTOM,
                "bl",
                team1,
                team2,
                {
                    home: team1,
                    toss: team2,
                    battingNow: team1,
                }
            );

            // --- Center ---

            const thisOverWidth = 100;
            this.thisOver = new CurrentOverBox(
                svg,
                WIDTH / 2,
                BANNER_TOP + BANNER_HEIGHT,
                rowHeight,
                "bc"
            );

            // XXX DEBUG
            this.thisOver.recordDelivery(1);
            this.thisOver.recordDelivery(2, [Marker.WIDE]);
            this.thisOver.recordDelivery(0, [Marker.WICKET]);
            this.thisOver.recordDelivery(4);
            this.thisOver.recordDelivery(5);
            this.thisOver.recordDelivery(6);
            this.thisOver.recordDelivery(7);
            window.setTimeout(() => {
                this.thisOver.newOver();
            }, 2000);
            window.setTimeout(() => {
                this.thisOver.recordDelivery(3);
            }, 3000);

            // Right side

            let textStyles = Utils.extend(Styles.textStyles, {
                "letter-spacing": "1", // empirical
                size: "1.2em",
            });
            let x = WIDTH - ACTION_MARGIN_W - NAME_BOX_WIDTH;
            this.onFieldView = new OnFieldView(
                svg,
                x,
                BANNER_BOTTOM,
                NAME_BOX_WIDTH,
                "bl",
                rowHeight,
                [team1.color, team2.color],
                textStyles
            );

            // DEBUG: the other team is batting
            if (SHOW_SECOND_INNINGS_QUICKVIEW) {
                this.teamView2 = new TeamView(
                    svg,
                    ACTION_MARGIN_W + 200,
                    BANNER_BOTTOM,
                    "bl",
                    team1,
                    team2,
                    {
                        home: team1,
                        toss: team2,
                        battingNow: team2,
                    }
                );
            }
        }

        // EBU margins
        if (SHOW_EBU_MARGINS) {
            this.actionSafeArea = svg.rect(
                ACTION_MARGIN_W,
                ACTION_MARGIN_H,
                WIDTH - 2 * ACTION_MARGIN_W,
                HEIGHT - 2 * ACTION_MARGIN_H
            );
            this.actionSafeArea.attr({
                fill: "none",
                stroke: "#00958e",
            });

            this.graphicsSafeArea = svg.rect(
                GRAPHICS_MARGIN_W,
                GRAPHICS_MARGIN_H,
                WIDTH - 2 * GRAPHICS_MARGIN_W,
                HEIGHT - 2 * GRAPHICS_MARGIN_H
            );
            this.graphicsSafeArea.attr({
                fill: "none",
                stroke: "#a72b30",
            });
        }
    } //ctor

    update(score) {
        if (TRY == 1 || TRY == 3) {
            //this.wkts.setValue(`W ${score.wickets}-${score.runs} R`);
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
}

module.exports = Display;
