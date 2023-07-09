// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Shape = require("shape");
const Styles = require("styles");
const TextBox = require("textbox");
const Utils = require("utils");

/**
 * The box showing a batter's information
 *
 * @class BatterBox2
 * @constructor
 * @param {Snap} svg SVG surface
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {int} h Height
 */
class BatterBox2 extends Shape {
    outline; // visible outline

    // text nodes
    textGroup;
    tName; // batter's name
    tRuns; // batter's run count
    runsLabel; // "R" label for runs
    tBalls; // batter's ball count
    ballsLabel; // "B" label for balls
    onStrikeIcon;

    constructor(svg, x, y, w, h, corner, styles = {}, onStrike = false) {
        super(svg, x, y, w, h, corner);

        // Grid params: where to put the components as a percentage of width
        // TODO make parameterizable
        let leftPadding = 10; // units???
        let namePct = 0.5;
        let runsPct = 0.2;
        let ballsPct = 0.2;

        // Create shapes.  All have baseline x = 0, y=0.  addTo() will
        // position the group containing the shapes.

        // Name: left-aligned

        // Use "My Name" as the initial value so it will have both
        // ascenders and descenders.
        this.tName = new TextBox(svg, 2, 0, w * namePct, -1, "tl", [
            { text: "My Name", styles },
        ]);
        this.tName.addTo(this.group);

        // Runs
        let runStyles = Utils.extend(styles, Styles.scoreStyles);
        this.tRuns = new TextBox(svg, w * (namePct + runsPct), 0, -1, h, "tr", [
            {
                text: "R",
                styles: Utils.extend(runStyles, {
                    fill: "#000",
                    "font-size": Styles.labelTextSize,
                }),
            },
            {
                text: "999",
                styles: Utils.extend(runStyles, {
                    fill: "#000",
                }),
                label: "value",
            },
        ]);
        this.tRuns.addTo(this.group);

        // Get the Y baseline of the runs
        let runsBBox = this.tRuns.svgText.getBBox();

        // Balls
        let ballStyles = Utils.extend(styles, Styles.numberStyles, {
            fill: "#000",
            "font-size": "x-small",
        });
        this.tBalls = new TextBox(
            svg,
            w * (namePct + runsPct + 0.05),
            runsBBox.y,
            -1,
            -1,
            "al",
            [
                {
                    text: "(",
                    styles: ballStyles,
                },
                {
                    text: "999",
                    styles: ballStyles,
                    label: "value",
                },
                {
                    text: "B",
                    styles: Utils.extend(ballStyles, {
                        "font-size": Styles.labelTextSize,
                    }),
                },
                {
                    text: ")",
                    styles: ballStyles,
                },
            ]
        );
        this.tBalls.addTo(this.group);

        // On strike?
        if (
            false && // XXX
            onStrike
        ) {
            // TODO put this back
            this.onStrikeIcon = svg.image("/bat-icon.png", 0, 0);
            this.onStrikeIcon.scale = 0.15; // hack --- FIXME
            this.group.add(this.onStrikeIcon);
        }
    } // ctor

    set name(value) {
        this.tName.setValue(value);
    }

    set runs(value) {
        this.tRuns.setValue(value, "value");
    }

    set balls(value) {
        this.tBalls.setValue(value, "value");
    }
}

module.exports = BatterBox2;
