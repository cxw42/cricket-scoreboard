// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Shape = require("shape");
const Styles = require("styles");
const TextBox = require("textbox");
const Utils = require("utils");

// Grid: vertical
const rowHeight = 20;
const cy = rowHeight / 2;
const margin = 2;
const nrows = 3;
const rowY = [...Array(nrows + 1).keys()].map((i) => (rowHeight + margin) * i);

/**
 * Score readout --- [wickets dash] runs
 *
 * @class ScoreReadout
 */
class ScoreReadout extends Shape {
    showWickets; // whether to show the wickets
    fontWeight; // font-weight for the numbers
    bgColor;

    text; // The textbox
    background; // the background

    constructor(svg, x, y, w_IGNORED, h, corner, opts = {}) {
        // Initialize with a placeholder width.  We will update it later
        // based on the text's width.
        super(svg, x, y, 1, h, corner);

        this.showWickets = !!opts.showWickets;
        this.fontWeight = opts.bold ? "bold" : "normal";
        this.bgColor = opts.bgColor || "#fff8b4";

        const textColor = Utils.getContrastingTextColor(
            opts.teamColor || "#ffffff"
        );

        // Fill in this.text
        this.makeBattingScore(svg, textColor);

        // Update the shape's width
        this.setBBox(x, y, this.text.text.getBBox().width, h, corner);

        // Put the text where it belongs
        // TODO this.text.setBBox

        // Background
        if(opts.bgColor !== 'none') {
            //debugger;
            this.outline = svg.rect(0, 0, this.bbox.w, this.bbox.h).attr(
                {
                    stroke: this.bgColor,
                    fill: this.bgColor,
                    rx: margin,
                }
            );
            this.group.add(this.outline);
            this.text.addTo(this.group);    // text in front
            /*
            {
            }
            */
        }
    } // ctor

    makeBattingScore(svg, scoreColor) {
        const baseStyles = Utils.extend(Styles.textStyles, Styles.scoreStyles);

        let items = [];

        // Wickets, if desired by the client
        if (this.showWickets) {
            items.push(
                {
                    text: "W",
                    styles: Utils.extend(baseStyles, {
                        fill: scoreColor,
                        "font-size": Styles.labelTextSize,
                    }),
                },
                {
                    text: "9",
                    styles: Utils.extend(baseStyles, {
                        fill: scoreColor,
                        class: "wicketsLost",
                        "font-weight": this.fontWeight,
                    }),
                },
                {
                    text: "-",
                    styles: Utils.extend(baseStyles, {
                        fill: scoreColor,
                        "font-weight": this.fontWeight,
                    }),
                }
            );
        }

        // Runs (always)
        items.push(
            {
                text: "456",
                styles: Utils.extend(baseStyles, {
                    fill: scoreColor,
                    class: "runsScored",
                    "font-weight": this.fontWeight,
                }),
            },
            {
                text: "R",
                styles: Utils.extend(baseStyles, {
                    fill: scoreColor,
                    "font-size": Styles.labelTextSize,
                }),
            }
        );

        this.text = new TextBox(
            svg,
            this.bbox.cornerX,
            this.bbox.cornerY,
            1, // placeholder width
            rowHeight,
            this.bbox.corner,
            items
            /*
            {
                background: {
                    stroke: this.bgColor,
                    fill: this.bgColor,
                    rx: margin,
                },
            }
            */
        );
        this.text.group.attr({
            class: "battingScore",
        });
        this.text.addTo(this.group);
    }

    update(runs, wkts = null) {
        // TODO figure out why attr(text:...) doesn't work.
        if (this.showWickets && wkts !== null) {
            this.group.select(".wicketsLost").node.textContent =
                wkts.toString();
        }
        this.group.select(".runsScored").node.textContent = runs.toString();
    }
}

module.exports = ScoreReadout;
