// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const D3Color = require("3rdparty/d3-color.v2.min");
const Snap = require("snapsvg");
// const WcagContrast = require("wcag-contrast");

const Path = require("path");
const Rect = require("rect");
const Shape = require("shape");
const Styles = require("styles");
const TextBox = require("textbox");
const Utils = require("utils");

const DEFAULT_PADDING = 2;
const DEFAULT_RADIUS = 10; // TODO adjust rounded-corner size?

const NBSP = String.fromCharCode(0xa0);

/**
 * Display in a rounded rectangle.  The number of rows is >=1.  The order is:
 *
 * - margin
 * - N-1 rows above the marker (if applicable)
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
        // Preconditions
        if (nRows < 1) {
            throw new Error(`nRows was ${nRows} but must be >= 1`);
        }

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
        const yAdjust = nRows > 1 ? 0 : markerRowHeight / 2;
        this.bg = this.makeGradientRect(
            "#ccc",
            yAdjust,
            this.bbox.h - yAdjust,
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

        // Marker
        this.marker = this.makeMarker("#ccc");
        this.marker.addTo(this.group);
    } // ctor

    makeRowBackgrounds(colors, radius) {
        let result = [];
        let rowY = this.bbox.h - this.layout.padding - this.layout.rowHeight;
        let bg;

        // Bottom row's background
        let actualRowHeight =
            this.layout.rowHeight + this.layout.markerRowHeight / 2;
        /*
        bg = this.makeGradientRect(
            colors[1],
            this.bbox.h - this.layout.padding - actualRowHeight,
            actualRowHeight
        );
        bg.svgRect.attr({
            rx: radius,
            ry: radius,
        });
        */
        let y = this.bbox.h - this.layout.padding - actualRowHeight;
        let pathTop;
        if (this.layout.nRows > 1) {
            pathTop =
                /*
                `
                M 0,0
                h ${this.bbox.w}
                v ${actualRowHeight - radius}
                a ${radius} ${radius} 0 0 1 ${-radius} ${radius}
                h ${-(this.bbox.w - 2*radius)}
                a ${radius} ${radius} 0 0 1 ${-radius} ${-radius}
                z
                `;
                */
                `
                M 0,${actualRowHeight / 2}
                V 0
                H ${this.bbox.w}
                `;
        } else {
            pathTop = `
                M 0,${actualRowHeight / 2}
                V ${radius}
                A ${radius} ${radius} 0 0 1 ${radius} 0
                H ${this.bbox.w - radius}
                A ${radius} ${radius} 0 0 1 ${this.bbox.w} ${radius}
                `;
        }
        const path =
            pathTop +
            `
            V ${actualRowHeight - radius}
            a ${radius} ${radius} 0 0 1 ${-radius} ${radius}
            h ${-(this.bbox.w - 2 * radius)}
            a ${radius} ${radius} 0 0 1 ${-radius} ${-radius}
            z
            `;
        bg = new Path(
            this.svg,
            0,
            y,
            this.bbox.w,
            actualRowHeight,
            "tl",
            path,
            {
                background: {
                    fill: "#ffc",
                },
            }
        );
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

    // The marker
    makeMarker(color, text) {
        const darker = D3Color.color(color).darker();
        const gradient = this.svg.gradient(
            `l(0,0,0,1)${color}-${color}:50-${darker}`
        );
        const cy =
            this.bbox.h -
            this.layout.padding -
            (this.layout.rowHeight + this.layout.markerRowHeight / 2);

        let label = new TextBox(
            this.svg,
            this.layout.padding + 11, // TODO make non-arbitrary?
            cy,
            -1,
            this.layout.markerHeight,
            "ml",
            [
                {
                    text: text || NBSP + "Lorem ipsum" + NBSP,
                    styles: Utils.extend(Styles.scoreStyles, {
                        "font-size": "12px",
                        "letter-spacing": Styles.textStyles["letter-spacing"],
                        "font-variant": "small-caps",
                    }),
                },
            ],
            {
                //alignment: "c",
                background: {
                    fill: gradient,
                },
            }
        );
        label.svgOutline.attr({
            ry: label.bbox.h / 2,
            rx: label.bbox.h / 2, // same as rx
        });
        return label;
    }

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
