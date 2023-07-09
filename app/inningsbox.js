// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const TextBox = require("textbox");
const Utils = require("utils");
const HOME = String.fromCodePoint(0x1f3e0); // or U+2302
const TOSS = String.fromCodePoint(0x1fa99);

require("3rdparty/snap.svg.free_transform");

/**
 * The box showing the innings, toss, and team scores
 *
 * @class InningsBox
 * @constructor
 * @param {Snap} svg SVG surface
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {Object} styles Text styles
 */
class InningsBox {
    // User-specified bounding-box coordinates
    bbox = {};

    group; // the group of shapes
    outline; // visible outline
    textGroup; // Text boxes

    // Raw data
    // TODO

    // text nodes
    // TODO
    // Team 1's abbreviation, plus whether team1 is playing at home, and
    // whether team1 won the toss.
    tTeam1;
    tTeam2; // ditto for team2

    tTeam1Score;
    tTeam2Score;

    makeTeam(svg, x, y, abbr, icons, styles) {
        styles = structuredClone(styles);
        styles["text-align"] = styles["text-anchor"] = "middle";
        styles["baseline"] = styles["alignment-baseline"] = "top";
        styles["dominant-baseline"] = "hanging";
        styles["weight"] = 1000;
        let t = svg
            .text(x, y, [abbr, icons])
            .attr(styles)
            .addClass("InningsBox-makeTeam");
        t.children()[1].attr({
            y: y + t.children()[0].getBBox().height,
            x,
            "font-style": "normal",
            "font-size": "0.75em",
        });

        return t;
    }

    constructor(svg, ulx, uly, w, h, styles = {}) {
        this.bbox.ulx = ulx;
        this.bbox.uly = uly;
        this.bbox.w = w;
        this.bbox.h = h;

        // Grid params: where to put the components as a percentage of width
        // TODO make parameterizable
        const topPadding = 5; // XXX
        let team1Pct = 0.1;
        let team2Pct = 0.9;
        let scoreMiddlePct = 0.5;

        // Clone the styles since we are going to change params
        styles = structuredClone(styles);
        styles.baseline = "baseline";

        this.group = svg.g().addClass("InningsBox");
        Utils.freeTransformTo(this.group, ulx, uly);
        // Now you can say things like
        //  this.group.freeTransform.attrs.translate.y -= 20;
        //  this.group.freeTransform.apply();
        // to move the box around.

        // Team abbrevs and icons
        this.tTeam1 = this.makeTeam(
            svg,
            w * team1Pct,
            topPadding,
            "SLC",
            HOME,
            Utils.extend(styles, {
                fill: "#fff",
            }) // XXX
        );
        this.group.add(this.tTeam1);
        this.tTeam2 = this.makeTeam(
            svg,
            w * team2Pct,
            topPadding,
            "PAK",
            TOSS,
            styles
        );
        this.group.add(this.tTeam2);

        // --- Scores ---
        const labelTextSize = "75%"; // from BowlerBox
        const scoreTextSize = "x-large";

        // Batting side
        this.scoresGroup = svg.g();
        styles.fill = "#fff"; // XXX
        // TODO text padding
        this.tTeam1Score = new TextBox(
            svg,
            w * 0.5 - topPadding, // XXX
            0,
            w * 0.3,
            h,
            "tr",
            [
                {
                    text: "W",
                    styles: Utils.extend(styles, {
                        "font-size": labelTextSize,
                    }),
                },
                {
                    text: "1-2",
                    styles: Utils.extend(styles, {
                        class: "inningsFigures",
                        "font-size": scoreTextSize,
                    }),
                },
                {
                    text: "R",
                    styles: Utils.extend(styles, {
                        "font-size": labelTextSize,
                    }),
                },
            ]
        );
        this.tTeam1Score.group.addClass("InningsBox-Team1Score");
        this.tTeam1Score.addTo(this.scoresGroup);

        styles.fill = "#000"; // XXX
        this.tTeam2Score = new TextBox(
            svg,
            w * 0.5 + topPadding, // XXX
            0,
            w * 0.3,
            h,
            "tl",
            [
                {
                    text: "123",
                    styles: Utils.extend(styles, {
                        class: "inningsFigures",
                        "font-size": scoreTextSize,
                    }),
                },
                {
                    text: "R",
                    styles: Utils.extend(styles, {
                        "font-size": labelTextSize,
                    }),
                },
            ]
        );
        this.tTeam1Score.group.addClass("InningsBox-Team2Score");
        this.tTeam2Score.addTo(this.scoresGroup);

        this.group.add(this.scoresGroup);

        // Bowling side
        // TODO

        if (false) {
            // XXX

            this.textGroup = svg.g();

            // Create shapes.  All have baseline x = 0, y=0.  addTo() will
            // position the group containing the shapes.

            // Name: left-aligned
            styles["text-align"] = styles["text-anchor"] = "start";

            // Use "My Name" as the initial value so it will have both
            // ascenders and descenders.
            this.tName = svg.text(0, 0, "My Name").attr(styles);
            this.textGroup.add(this.tName);

            // Figures
            const labelTextSize = "50%"; // empirical

            styles["text-align"] = styles["text-anchor"] = "end";
            this.tFigures = svg
                .text(w * (namePct + scorePct), 0, ["W", "1-2", "R"])
                .attr(styles);
            let kids = this.tFigures.children();
            kids[0].attr({
                "font-size": labelTextSize,
            });
            kids[1].attr({
                class: "bowlingFigures",
            });
            kids[2].attr({
                "font-size": labelTextSize,
            });
            this.textGroup.add(this.tFigures);

            // Overs
            //styles['font-size'] = 'small'; // TODO make parameterizable
            this.tOvers = svg
                .text(w * (namePct + scorePct + ballsPct), 0, [
                    "1",
                    "O",
                    "2",
                    "B",
                ])
                .attr(styles);
            kids = this.tOvers.children();
            kids[0].attr({
                class: "bowlingCompletedOvers",
            });
            kids[1].attr({
                "font-size": labelTextSize,
                "font-weight": 1000,
            });
            kids[2].attr({
                class: "bowlingBalls",
            });
            kids[3].attr({
                "font-size": labelTextSize,
            });
            this.textGroup.add(this.tOvers);

            this.group = svg.g();
            this.group.add(this.textGroup);

            /*
            // DEBUG
            let bbox = this.textGroup.getBBox();
            this.group.add(svg.rect(bbox.x, bbox.y, bbox.width, bbox.height)
                .attr({
                    fill: 'none',
                    stroke: '#ff0'
                }));
            */

            // Position the group.  TODO refactor this code, common with BatterBox,
            // to a single place.

            // Add the group off-screen so we can find out where it is.
            this.group.attr("transform", "translate(-1000, -1000)");
            const where = this.group.getBBox();

            // Get the baseline location.  E.g., top = -1010 means
            // the top is 10px above the baseline === baseline is 10px below
            // the top.
            const dyTopToBaseline = -1000 - where.y;

            // Center textGroup vertically within group
            const vmargin = this.bbox.h - where.height;

            // Move the group horizontally, left-justified
            // E.g., where.left = -1010 => move position.x +10 (right)
            this.textGroup.attr(
                "transform",
                `translate(${-1000 - where.left}, ${vmargin / 2})`
            );

            this.group.attr(
                "transform",
                `translate(${this.bbox.ulx}, ${
                    this.bbox.uly + dyTopToBaseline
                })`
                // XXX *0 seems to make it look better --- why?
            );

            // Second line - XXX placeholder
            this.thisOverGroup = svg.g();
            /*svg.rect(0, -dyTopToBaseline + this.bbox.h/2, this.bbox.w,
                        this.bbox.h/2).attr({
                        fill: '#eee',
                        stroke: 'none',
                    });*/
            this.group.add(this.thisOverGroup);

            const ballIconHeight = this.bbox.h * 0.4;
            const ballIconTop =
                -dyTopToBaseline +
                this.bbox.h / 2 +
                0.5 * (this.bbox.h / 2 - ballIconHeight);
            for (let i = 0; i < 6; ++i) {
                let rect = svg.circle(
                    i * (ballIconHeight * 1.1) + ballIconHeight / 2,
                    ballIconTop + ballIconHeight / 2,
                    ballIconHeight / 2,
                    ballIconHeight / 2
                );
                rect.attr({
                    fill: "#fff",
                    "fill-opacity": "35%",
                });
                this.thisOverGroup.add(rect);
            }
        } // XXX

        /*
        // Add the outline now that we have a center
        this.outline = svg.rect(0, 0,
            //0, -dyTopToBaseline,
            this.bbox.w, this.bbox.h).attr({
            fill: 'none',
            stroke: '#0dd'
        });
        this.group.add(this.outline);
        */
    } // ctor

    _updateFigures() {
        this.tFigures.select(".bowlingFigures").attr({
            text: `${this.currWickets}-${this.currRuns}`,
        });
    }

    set name(value) {
        this.tName.attr({
            text: value,
        });
    }

    set wickets(value) {
        this.currWickets = value;
        this._updateFigures();
    }

    set runs(value) {
        this.currRuns = value;
        this._updateFigures();
    }

    set balls(value) {
        const completedOvers = Math.floor(value / 6);
        const ballsThisOver = value % 6;
        this.tOvers.select(".bowlingCompletedOvers").attr({
            text: completedOvers,
        });
        this.tOvers.select(".bowlingBalls").attr({
            text: ballsThisOver,
        });
    }
}

module.exports = InningsBox;
