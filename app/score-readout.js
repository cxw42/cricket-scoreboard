// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Shape = require("shape");
const Styles = require("styles");
const Textbox = require("textbox");
const Utils = require("utils");

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
 *  - font for additional font properties on the numbers
 *  - fontLabel for additional font properties on the "W" and "R" labels
 *  - background for the background to use
 *  - teamColor for the team's color (default #fff)
 *  - labels: object with "w" and "r" bools for whether to show the "W" and "R" labels, respectively
 */
class ScoreReadout extends Textbox {
    showWickets; // whether to show the wickets

    text; // The textbox
    background; // the background

    constructor(svg, x, y, w, h, corner, opts = {}) {
        let showWickets = !!opts.showWickets;
        let font = structuredClone(opts.font || {});
        let fontLabel = structuredClone(opts.fontLabel || {});
        let bgStyle = opts.background || { stroke: "none", fill: "#fff8b4" };
        let labels = Utils.extend({ r: true, w: true }, opts.labels || {});

        const textColor = Utils.getContrastingTextColor(
            opts.teamColor || "#ffffff"
        );

        let items = ScoreReadout.makeScoreItems(
            showWickets,
            font,
            fontLabel,
            textColor,
            labels
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
    static makeScoreItems(showWickets, font, fontLabel, scoreColor, labels) {
        const baseStyles = Utils.extend(Styles.textStyles, Styles.scoreStyles);

        let items = [];

        // Wickets, if desired by the client
        if (showWickets) {
            if (labels.w) {
                items.push({
                    text: "W",
                    styles: Utils.extend(
                        baseStyles,
                        {
                            fill: scoreColor,
                            "font-size": Styles.labelTextSize,
                        },
                        fontLabel
                    ),
                });
            }
            items.push(
                {
                    text: "9",
                    styles: Utils.extend(
                        baseStyles,
                        {
                            fill: scoreColor,
                            class: "wicketsLost",
                        },
                        font
                    ),
                },
                {
                    text: "-",
                    styles: Utils.extend(
                        baseStyles,
                        {
                            fill: scoreColor,
                        },
                        font
                    ),
                }
            );
        }

        // Runs (always)
        items.push({
            text: "456",
            styles: Utils.extend(
                baseStyles,
                {
                    fill: scoreColor,
                    class: "runsScored",
                },
                font
            ),
        });
        if (labels.r) {
            items.push({
                text: "R",
                styles: Utils.extend(
                    baseStyles,
                    {
                        fill: scoreColor,
                        "font-size": Styles.labelTextSize,
                    },
                    fontLabel
                ),
            });
        }

        return items;
    }

    update(runs, wkts = null) {
        // TODO figure out why attr(text:...) doesn't work.
        if (this.showWickets && wkts !== null) {
            this.group.select(".wicketsLost").node.textContent =
                wkts.toString();
        }
        this.group.select(".runsScored").node.textContent = runs.toString();

        // If we are autosizing, resize based on the new text width
        this.lineUp();
    }
}

module.exports = ScoreReadout;
