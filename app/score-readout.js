// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const D3Color = require("3rdparty/d3-color.v2.min");
const Snap = require("snapsvg");
const WcagContrast = require("wcag-contrast");

const Shape = require("shape");
const Styles = require("styles");
const TextBox = require("textbox");
const Utils = require("utils");

const EMDASH = String.fromCodePoint(0x2014);

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
        super(svg, x, y, w, h, corner);
        this.showWickets = !!opts.showWickets;
        this.fontWeight = opts.bold ? "bold" : "normal";
        this.bgColor = opts.bgColor || "#fff8b4";

        const textColor = Utils.getContrastingTextColor(
            opts.teamColor || "#ffffff"
        );

        // Group to hold this team's items, except for the background.
        this.makeBattingScore(svg, textColor);

        // TODO resize to natural width
    } // ctor

    makeBattingScore(svg, scoreColor) {
        const baseStyles = Utils.extend(Styles.textStyles, Styles.scoreStyles);

        let items = [];
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

        let score = new TextBox(
            svg,
            w - margin,
            cy,
            w - scoreX,
            rowHeight,
            "mr",
            items,
            {
                background: {
                    stroke: this.bgColor,
                    fill: this.bgColor,
                    rx: margin,
                },
            }
        );
        score.group.attr({
            class: "battingScore",
        });
        score.addTo(this.group);
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
