// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Shape = require("shape");
const Styles = require("styles");
const Textbox = require("textbox");
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
 * @constructor
 * @param {Snap} svg See Shape
 * @param {int} x See Shape
 * @param {int} y See Shape
 * @param {int} w See Shape
 * @param {int} h See Shape
 * @param {String} corner See Shape
 * @param {Object} opts Object of options:
 *  - showWickets to show the wickets (default false)
 *  - bold to boldface the score (default false)
 *  - background for the background to use
 *  - teamColor for the team's color (default #fff)
 */
class ScoreReadout extends Textbox {
    showWickets; // whether to show the wickets

    text; // The textbox
    background; // the background

    constructor(svg, x, y, w, h, corner, opts = {}) {
        let showWickets = !!opts.showWickets;
        let fontWeight = opts.bold ? "bold" : "normal";
        let bgStyle = opts.background || { stroke: "none", fill: "#fff8b4" };

        const textColor = Utils.getContrastingTextColor(
            opts.teamColor || "#ffffff"
        );

        let items = ScoreReadout.makeScoreItems(
            showWickets,
            fontWeight,
            textColor
        );

        super(svg, x, y, w, h, corner, items, {
            background: bgStyle,
        });
        this.showWickets = showWickets;
    } // ctor

    /**
     * Make the items we will include in the score
     *
     * @method makeScoreItems
     */
    static makeScoreItems(showWickets, fontWeight, scoreColor) {
        const baseStyles = Utils.extend(Styles.textStyles, Styles.scoreStyles);

        let items = [];

        // Wickets, if desired by the client
        if (showWickets) {
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
                        "font-weight": fontWeight,
                    }),
                },
                {
                    text: "-",
                    styles: Utils.extend(baseStyles, {
                        fill: scoreColor,
                        "font-weight": fontWeight,
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
                    "font-weight": fontWeight,
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

        return items;
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
