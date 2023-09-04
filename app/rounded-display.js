// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const D3Color = require("3rdparty/d3-color.v2.min");
const Snap = require("snapsvg");
// const WcagContrast = require("wcag-contrast");

const Rect = require("rect");
const Shape = require("shape");
const Styles = require("styles");
const TextBox = require("textbox");
const Utils = require("utils");

const DEFAULT_PADDING = 2;

/**
 * Display in a rounded rectangle.  The number of rows is >=1.  The order is:
 *
 * - margin
 * - N-1 rows above the marker
 * - marker (capsule)
 * - one row below the marker
 * - margin
 *
 * @class RoundedDisplay
 * @constructor
 * @param {Snap} svg SVG surface (see {{#crossLink "Shape"}}{{/crossLink}})
 * @param {int} x Anchor X coordinate
 * @param {int} y Anchor Y coordinate
 * @param {int} w Width
 * @param {String} corner Corner
 * @param {int} rowHeight Row height --- **not** whole-box height!
 * @param {int} nRows Number of rows, >= 1.
 * @param {Object} [textStyles] Text styles
 * @param {Object} [opts] Options
 */
class RoundedDisplay extends Shape {
    /**
     * Layout parameters
     *
     * @protected
     * @property layout
     */
    layout = {};

    constructor(
        svg,
        x,
        y,
        w,
        corner,
        nRows,
        rowHeight,
        textStyles = {},
        opts = {}
    ) {
        // Compute vertical layout
        const padding = opts.padding || DEFAULT_PADDING;
        const markerRowHeight = rowHeight * 0.8;
        const markerHeight = rowHeight * 0.65;
        const markerYCenter = padding + 2 * rowHeight + markerRowHeight / 2;
        const h = nRows * rowHeight + 2 * padding + markerRowHeight;

        // Construct, and save layout parameters
        super(svg, x, y, w, h, corner);
        this.layout = {padding, markerRowHeight, markerHeight, markerYCenter, nRows, rowHeight};

        // Overall background
        {
            const lighter = "#ccc";
            const darker = D3Color.color(lighter).darker();
            const gradient = svg.gradient(
                `l(0,0,0,1)${lighter}-${lighter}:50-${darker}`
            );
            this.bg = new Rect(svg, 0, 0, w + padding, h, "tl", {
                background: {
                    fill: gradient,
                },
            });
            this.bg.addTo(this.group);
        }

        // Backgrounds for the rows
        this.bgBatting = this.makeGradientRect(
            teamColors[0],
            padding,
            2 * rowHeight + markerRowHeight / 2 - padding
        );
        this.bgBatting.addTo(this);
        this.bgBowling = this.makeGradientRect(
            teamColors[1],
            2 * rowHeight + markerRowHeight / 2 + padding,
            rowHeight + markerRowHeight / 2
        );
        this.bgBowling.addTo(this);

        // Batters
        this.batterOnStrike = new BatterBox2(
            svg,
            padding,
            padding,
            w - padding,
            rowHeight,
            "tl",
            Utils.extend(textStyles, {
                teamColor: teamColors[0],
            })
        );
        this.batterOnStrike.addTo(this);

        this.batterNotOnStrike = new BatterBox2(
            svg,
            padding,
            padding + rowHeight,
            w - padding,
            rowHeight,
            "tl",
            Utils.extend(textStyles, {
                teamColor: teamColors[0],
            })
        );
        this.batterNotOnStrike.addTo(this);

        // Label
        {
            const lighter = "#ccc";
            const darker = D3Color.color(lighter).darker();
            const gradient = svg.gradient(
                `l(0,0,0,1)${lighter}-${lighter}:50-${darker}`
            );
            this.label = new TextBox(
                svg,
                padding + 11,
                markerYCenter,
                55,
                markerHeight,
                "ml",
                [
                    {
                        text: "In the Middle",
                        styles: Utils.extend(Styles.scoreStyles, {
                            "font-size": "12px",
                            "letter-spacing":
                                Styles.textStyles["letter-spacing"],
                            "font-variant": "small-caps",
                        }),
                    },
                ],
                {
                    alignment: "c",
                    background: {
                        fill: gradient,
                    },
                }
            );
            this.label.svgOutline.attr({
                ry: this.label.bbox.h / 2,
                rx: this.label.bbox.h / 2, // same as rx
            });
            this.label.addTo(this);
        }

        // Bowler
        this.bowler = new BowlerBox2(
            svg,
            padding,
            markerYCenter + markerRowHeight / 2,
            w - padding,
            rowHeight,
            "tl",
            Utils.extend(textStyles, {
                teamColor: teamColors[1],
            })
        );
        this.bowler.addTo(this);

        this.update(situation);
    } // ctor

    makeGradientRect(color, y, h) {
        const darker = D3Color.color(color).darker();
        const gradient = this.svg.gradient(
            `l(0,0,0,1)${color}-${color}:50-${darker}`
        );
        let bg = new Rect(this.svg, padding, y, this.bbox.w - padding, h, "tl", {
            background: {
                fill: gradient,
            },
        });
        return bg;
    }

}

module.exports = RoundedDisplay;
