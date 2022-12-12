// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Utils = require("utils");

/**
 * The box showing a bowler's information.
 *
 * ```
 * Name         W${w}-${r}R   ${o}o${b}b
 * . . . . . .
 * ```
 *
 * @class BowlerBox
 * @constructor
 * @param {Snap} svg SVG surface
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {Object} styles Text styles
 * @param {Object} opts Options
 */
class BowlerBox {
    // User-specified bounding-box coordinates
    bbox = {};

    group; // the group of shapes
    outline; // visible outline
    textGroup; // the text on the first line
    thisOverGroup; // shapes on the second line - what happened this over

    // Raw data
    currWickets; // bowler's wickets taken
    currRuns; // bowler's runs allowed
    currBalls; // legal deliveries

    // Two.Text instances
    tName; // bowler's name
    tFigures; // wkts-runs
    tOvers; // bowler's ball count (legal deliveries)
    //ballsLabel; // "B" label for balls

    constructor(svg, ulx, uly, w, h, styles = {}, opts = {}) {
        this.bbox.ulx = ulx;
        this.bbox.uly = uly;
        this.bbox.w = w;
        this.bbox.h = h;

        // Grid params: where to put the components as a percentage of width
        // TODO make parameterizable
        let leftPadding = 10; // units???
        let namePct = 0.5;
        let scorePct = 0.27; // wkt-run
        let ballsPct = 0.17;

        // Clone the styles since we are going to change params
        styles = structuredClone(styles);
        styles.baseline = "baseline";

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
            .text(w * (namePct + scorePct + ballsPct), 0, ["1", "O", "2", "B"])
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
        const pos = Utils.positionGroupAt(
            this.group,
            this.textGroup,
            ulx,
            uly,
            w,
            h
        );

        // Second line
        if (!opts.oneLineOnly) {
            this.thisOverGroup = svg.g();
            this.group.add(this.thisOverGroup);

            const ballIconHeight = this.bbox.h * 0.4;
            const ballIconTop =
                pos.yInGroup +
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
        }

        /*
        // Add the outline now that we have a center
        this.outline = svg.rect(pos.xInGroup, pos.yInGroup, w, h).attr({
            fill: 'none',
            stroke: '#0ff'
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

module.exports = BowlerBox;
