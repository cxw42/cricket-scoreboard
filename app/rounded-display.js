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
const DEFAULT_RADIUS = 10; // TODO adjust rounded-corner size?

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
 * @param {Object} [opts.colors] Array of two colors, first for above the marker
 *                               and second for below the marker.
 * @param {Object} [opts.borderWidth] Array of two colors, first for above the marker
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
        this.layout = {
            padding,
            markerRowHeight,
            markerHeight,
            markerYCenter,
            nRows,
            rowHeight,
        };

        // Colors.  The defaults are arbitrary choices.
        const colors = opts.colors || [
            //
            D3Color.color("steelblue"),
            D3Color.color("goldenrod"),
        ];

        // Background.  TODO fix the size.
        this.bg = this.makeGradientRect(
            "#ccc",
            0,
            h,
            -padding,
            this.bbox.w + 2 * padding
        );
        this.bg.svgRect.attr({
            // TODO adjust rounded-corner size?
            rx: DEFAULT_RADIUS,
            ry: DEFAULT_RADIUS,
        });
        this.bg.addTo(this.group);

        // Backgrounds for the rows, working bottom-up.
        this.rowBackgrounds = this.makeRowBackgrounds(colors, DEFAULT_RADIUS);
        for (const bg of this.rowBackgrounds) {
            bg.addTo(this.group);
        }

        /*
        // Batters
        this.batterOnStrike = new BatterBox2(
            svg,
            padding,
            padding,
            w - padding,
            rowHeight,
            "tl",
            Utils.extend(textStyles, {
                teamColor: colors[0],
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
                teamColor: colors[0],
            })
        );
        this.batterNotOnStrike.addTo(this);
        */

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

        /*
        // Bowler
        this.bowler = new BowlerBox2(
            svg,
            padding,
            markerYCenter + markerRowHeight / 2,
            w - padding,
            rowHeight,
            "tl",
            Utils.extend(textStyles, {
                teamColor: colors[1],
            })
        );
        this.bowler.addTo(this);
        */
    } // ctor

    makeRowBackgrounds(colors, radius) {
        let result = [];
        let rowY = this.bbox.h - this.layout.padding - this.layout.rowHeight;
        let bg;

        // Bottom row's background
        let actualRowHeight =
            this.layout.rowHeight + this.layout.markerRowHeight / 2;
        bg = this.makeGradientRect(
            colors[1],
            this.bbox.y - this.layout.padding - actualRowHeight,
            actualRowHeight
        );
        bg.svgRect.attr({
            rx: radius,
            ry: radius,
        });
        result.unshift(bg);

        if (this.layout.nRows == 1) {
            return result;
        }

        // One background for all other rows
        bg = this.makeGradientRect(
            colors[0],
            this.layout.padding,
            (this.layout.nRows - 1) * this.layout.rowHeight +
                this.layout.markerRowHeight / 2 -
                this.layout.padding
        );
        bg.svgRect.attr({
            rx: radius,
            ry: radius,
        });
        result.unshift(bg);

        return result;
    } // makeRowBackgrounds()

    makeGradientRect(color, y, h, x, w) {
        x = x || 0;
        w = w || this.bbox.w;

        const darker = D3Color.color(color).darker();
        const gradient = this.svg.gradient(
            `l(0,0,0,1)${color}-${color}:50-${darker}`
        );
        let bg = new Rect(this.svg, x, y, w, h, "tl", {
            background: {
                fill: gradient,
            },
        });
        return bg;
    }
}

module.exports = RoundedDisplay;
