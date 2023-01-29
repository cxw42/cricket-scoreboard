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

// Grid: horizontal
const w = 150;
const homeX = margin;
const tossX = margin + rowHeight;
const nameX = margin + rowHeight * 2;

// TODO replace this with the native width of the score, plus padding
const scoreX = margin + rowHeight * 4.1;

/**
 * Score readout --- [wickets dash] runs
 *
 * @class ScoreReadout
 */
class ScoreReadout extends Shape {
    showWickets; // whether to show the wickets
    fontWeight; // font-weight for the numbers
    bgColor;


    constructor(svg, x, y, w, h, corner, opts = {}) {
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

        debugger;
        this.text = new TextBox(
            svg,
            this.bbox.ulx,
            this.bbox.cy,
            1,  // placeholder width
            rowHeight,
            "ml",
            items,
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
