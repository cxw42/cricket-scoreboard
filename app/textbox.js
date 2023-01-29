// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Shape = require("shape");
const Snap = require("snapsvg");
const Utils = require("utils");
require("3rdparty/snap.svg.free_transform");

/**
 * A text box anchored at a point
 *
 * @class Textbox
 * @constructor
 * @param {Snap} svg The SVG
 * @param {int} x Reference X
 * @param {int} y Reference Y
 * @param {int} w Width.  If w<0, use the native width of the text.
 * @param {int} h Height.  If h<0, use the native height of the text.
 * @param {String} corner Which corner `x` and `y` relate to.
 *                        Must be `[TMB][LCR]`.
 * @param {Object|Array[Object]} textAndStyles: array of {text, styles}, where
 *                               styles are per
 *                               [Two.Text](https://two.js.org/docs/text/).
 * @param {Object} opts Options.  Keys include:
 *      - `background`: styles for the background
 */
class Textbox extends Shape {
    svgOutline; // visible outline or background - svg <rect>
    svgText; // svg <text> node

    constructor(svg, x, y, w, h, corner, textAndStyles, opts = {}) {
        // If we are going to use the native size(s) of the text, create the shape with
        // interim size(s).
        super(svg, x, y, w < 0 ? 1 : w, h < 0 ? 1 : h, corner);

        opts.background = opts.background || {};
        if (typeof textAndStyles !== typeof []) {
            textAndStyles = [textAndStyles];
        }

        // always put the text on the baseline
        let localStyles = {};
        localStyles.baseline = "baseline";

        corner = corner.toLowerCase();

        // Get the text alignment based on the reference corner
        if (corner.includes("l")) {
            localStyles.alignment = "start";
        } else if (corner.includes("c")) {
            localStyles.alignment = "middle";
        } else if (corner.includes("r")) {
            localStyles.alignment = "end";
        } else {
            throw "corner must specify l, c, or r";
        }

        // Create the text and position it horizontally
        localStyles["text-align"] = localStyles["text-anchor"] =
            localStyles.alignment;
        this.svgText = svg.text(
            0,
            0,
            textAndStyles.map((o) => Utils.extend(o.text, localStyles))
        );
        const kids = this.svgText.children();
        for (let i = 0; i < textAndStyles.length; ++i) {
            kids[i].attr(
                Utils.extend(textAndStyles[i].styles || {}, localStyles)
            );
        }
        const textBBox = this.svgText.getBBox();

        // Apply the native size of the text if we were asked to
        if (w < 0 || h < 0) {
            let actualW = w < 0 ? textBBox.width : w;
            let actualH = h < 0 ? textBBox.height : h;
            this.setBBox(x, y, actualW, actualH, corner);
            console.log(this.bbox);
        }

        // Position the text within the group
        let ftt = svg.freeTransform(this.svgText);
        ftt.hideHandles();

        // Text X: the bbox already takes the corner and width into account, so
        // we don't need to here.
        ftt.attrs.translate.x = x - this.bbox.ulx;

        // Text Y: we are shifting the baseline from y=0 so need to consider the corner.
        let translateY;
        if (corner.includes("t")) {
            translateY = -textBBox.y; // shift baseline down
        } else if (corner.includes("m")) {
            translateY = this.bbox.h / 2 - textBBox.cy;
        } else if (corner.includes("b")) {
            translateY = this.bbox.h - textBBox.y2;
        }
        ftt.attrs.translate.y = translateY;

        ftt.apply();

        // Outline
        this.svgOutline = svg.rect(0, 0, this.bbox.w, this.bbox.h).attr(
            Utils.extend(
                {
                    fill: "none",
                    stroke: "none",
                },
                opts.background
            )
        );

        // Add the shapes to the group
        this.group.add(this.svgOutline);
        this.group.add(this.svgText);
    }

    /**
     * Add this instance to an SVG element
     *
     * @method addTo
     * @param {Object} parent The element
     */
    addTo(parent) {
        parent.add(this.group);
    }

    /**
     * Remove this instance from the SVG
     *
     * @method remove
     */
    remove() {
        this.group.remove();
    }

    setValue(value) {
        this.svgText.attr({
            text: value,
        });
    }
}

module.exports = Textbox;
