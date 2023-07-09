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

        // Runs and balls
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
                text: "99",
                styles: Utils.extend(runStyles, {
                    fill: "#000",
                }),
            },
        ]);
        this.tRuns.addTo(this.group);
        /*

        styles["text-align"] = styles["text-anchor"] = "end";
        styles["font-size"] = Styles.powerplayTextSize;
        this.tBalls = svg
            .text(w * (namePct + runsPct + ballsPct), 0, "84")
            .attr(styles);
        this.textGroup.add(this.tBalls);

        // Labels
        runStyles["font-size"] = Styles.labelTextSize;
        styles["font-size"] = Styles.labelTextSize;
        runStyles["text-align"] = runStyles["text-anchor"] = "start";
        styles["text-align"] = styles["text-anchor"] = "start";

        this.runsLabel = svg
            .text(w * (namePct + runsPct) - 25, 0, "R") // FIXME --- use a TextBox
            .attr(runStyles);
        this.textGroup.add(this.runsLabel);

        styles["font-size"] = "x-small";
        this.ballsLabel = svg
            .text(w * (namePct + runsPct + ballsPct), 0, "B")
            .attr(styles);
        this.textGroup.add(this.ballsLabel);

        this.group = svg.g().addClass("BatterBox2");
        this.group.add(this.textGroup);

        */
        /*
        // DEBUG
        let bbox = this.textGroup.getBBox();
        this.group.add(svg.rect(bbox.x, bbox.y, bbox.width, bbox.height)
            .attr({
                fill: 'none',
                stroke: '#ff0'
            }));
        */

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

        // this.group.transform('t100,100');   // XXX DEBUG for visibility

        /*
        // Add the outline now that we have a center
        this.outline = svg.rect(pos.xInGroup, pos.yInGroup, w, h).attr({
            fill: "none",
            stroke: "none", // '#0ff'
        });
        this.group.add(this.outline);
        */
    } // ctor

    set name(value) {
        this.tName.setValue(value);
    }

    set runs(value) {
        this.tRuns.attr({
            text: value,
        });
    }

    set balls(value) {
        this.tBalls.attr({
            text: value,
        });
    }
}

module.exports = BatterBox2;