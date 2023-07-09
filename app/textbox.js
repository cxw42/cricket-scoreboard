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
 * @class TextBox
 * @constructor
 * @param {Snap} svg The SVG
 * @param {int} x Reference X
 * @param {int} y Reference Y
 * @param {int} w Width.  If w<0, use the native width of the text.
 * @param {int} h Height.  If h<0, use the native height of the text.
 * @param {String} corner Which corner `x` and `y` relate to.
 *                        Must be `[TMAB][LCR]`.
 *                        TMB/LCR are per class Shape.  Corner "A" means the
 *                        Y coordinate is the bAseline of the text.
 * @param {Object|Array[Object]} textAndStyles Array of `{text, styles[, label]}`,
 * @param {String} textAndStyles.text The text
 * @param {String} textAndStyles.styles SVG `<text>` styles
 * @param {String} [textAndStyles.label] Label usable with
 *      {{#crossLink "TextBox/setValue:method"}}{{/crossLink}}.
 *      The label must be a valid CSS class name (no leading dot).
 *
 * @param {Object} [opts] Options.  Keys include:
 *      - `background`: styles for the background (Object or 'none')
 */
class TextBox extends Shape {
    svgOutline; // visible outline or background - svg <rect>
    svgText; // svg <text> node
    fttText; // freetransform for svgText

    _linedUp = false; // whether lineUp() has been called
    _baseline = false; // whether we are baseline-aligned
    _topToBaselineY; // how far from the top of the box to the baseline

    constructor(svg, x, y, w, h, corner, textAndStyles, opts = {}) {
        // If we are going to use the native size(s) of the text, create the shape with
        // interim size(s).

        // Baseline: give the parent class something it can understand.
        let superCorner = corner.toLowerCase();
        let baseline = false;
        if (superCorner.includes("a")) {
            baseline = true;
            superCorner = superCorner.replace("a", "t");
        }

        super(svg, x, y, w < 0 ? 1 : w, h < 0 ? 1 : h, superCorner);
        this._baseline = baseline;
        this.origBBox.w = w;
        this.origBBox.h = h;

        let background = opts.background || "none";
        if (background === "none") {
            background = {};
        }

        if (!Array.isArray(textAndStyles)) {
            textAndStyles = [textAndStyles];
        }

        // always put the text on the baseline
        let localStyles = {};
        localStyles.baseline = "baseline";

        // Get the text alignment based on the reference corner
        if (this.bbox.corner.includes("l")) {
            localStyles.alignment = "start";
        } else if (this.bbox.corner.includes("c")) {
            localStyles.alignment = "middle";
        } else if (this.bbox.corner.includes("r")) {
            localStyles.alignment = "end";
        }

        // Create the text and position it horizontally
        localStyles["text-align"] = localStyles["text-anchor"] =
            localStyles.alignment;
        this.svgText = svg.text(
            0,
            0,
            textAndStyles.map((o) => o.text)
        );
        const kids = this.svgText.children();
        for (let i = 0; i < textAndStyles.length; ++i) {
            kids[i].attr(
                Utils.extend(textAndStyles[i].styles || {}, localStyles)
            );
            if (textAndStyles[i].label) {
                kids[i].addClass(`label-${textAndStyles[i].label}`);
            }
        }

        // Position the text within the group
        this.fttText = svg.freeTransform(this.svgText);
        this.fttText.hideHandles();

        // Outline --- lineUp() will size it.
        this.svgOutline = svg.rect(0, 0, 1, 1).attr(
            Utils.extend(
                {
                    fill: "none",
                    stroke: "none",
                },
                background
            )
        );

        this.lineUp();

        // Add the shapes to the group
        this.group.add(this.svgOutline);
        this.group.add(this.svgText);

        // XXX HACK --- it starts out a bit too small.  Doing this seems to help.
        setTimeout(() => {
            this.lineUp();
        }, 0);
    }

    /**
     * Line everything up
     *
     * @protected
     * @method lineUp
     */
    lineUp() {
        //debugger;
        const textBBox = this.svgText.getBBox();
        // console.log(textBBox);

        // If we have a fixed size, and we've already done alignment, we're done.
        if (this._linedUp && this.origBBox.w >= 0 && this.origBBox.h >= 0) {
            return;
        }

        // Apply the native size of the text if we were asked to
        if (this.origBBox.w < 0 || this.origBBox.h < 0) {
            let actualW =
                this.origBBox.w < 0 ? textBBox.width : this.origBBox.w;
            let actualH =
                this.origBBox.h < 0 ? textBBox.height : this.origBBox.h;
            this.setBBox(
                this.origBBox.cornerX,
                this.origBBox.cornerY,
                actualW,
                actualH,
                this.origBBox.corner
            );
        }

        // Text X: the bbox already takes the corner and width into account, so
        // we don't need to here.
        if (!this._linedUp || this.origBBox.w < 0) {
            this.fttText.attrs.translate.x =
                this.origBBox.cornerX - this.bbox.ulx;
        }

        // Text Y: we are shifting the baseline from y=0 so need to consider the corner.
        if (!this._linedUp || this.origBBox.h < 0) {
            this._topToBaselineY = textBBox.y;
            let translateY;
            if (this._baseline) {
                translateY = this._topToBaselineY - this.origBBox.y; // TODO is this right?
            } else if (this.origBBox.corner.includes("t")) {
                translateY = -textBBox.y; // shift baseline down
            } else if (this.origBBox.corner.includes("m")) {
                translateY = this.bbox.h / 2 - textBBox.cy;
            } else if (this.origBBox.corner.includes("b")) {
                translateY = this.bbox.h - textBBox.y2;
            }
            // This transform is cumulative, so use += instead of =.
            //
            this.fttText.attrs.translate.y += translateY;
        }

        this.fttText.apply();

        // Resize the outline
        this.svgOutline.attr({ width: this.bbox.w, height: this.bbox.h });

        this._linedUp = true;
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

    /**
     * Set the text.
     *
     * @method setValue
     * @param {String} value The new text
     * @param {String} [label] If given, update the `<tspan>` with
     *                         the given label.  Otherwise, update the
     *                         whole `<text>` element.
     *
     */
    setValue(value, label = null) {
        let selector;
        if (label === null) {
            selector = "tspan"; // select() gives us the first match
        } else {
            selector = `.label-${label}`;
        }
        this.svgText.select(selector).attr({
            "#text": value, // not sure why it has to be '#text' for tspans
        });
    }
}

module.exports = TextBox;
