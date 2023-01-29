// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Snap = require("snapsvg");
require("3rdparty/snap.svg.free_transform");

const WcagContrast = require("wcag-contrast");

/**
 * Utilities
 *
 * @module utils
 */

/**
 * Extend an object with additional properties
 *
 * @method extend
 * @param {object} source An object to clone
 * @param {object} ...extras Extra properties to add (one or more objects)
 * @return A new object
 */
function extend(source, ...extras) {
    let result = structuredClone(source);
    for (const extra of extras) {
        result = Object.assign(result, extra);
    }
    return result;
}

/**
 * Position a snapsvg element and return its freeTransform instance
 *
 * @method freeTransformTo
 * @param {Snap object} el The element
 * @param {int} ulx Upper-left X
 * @param {int} uly Upper-left Y
 */
function freeTransformTo(el, ulx, uly) {
    const svg = Snap(el.node.ownerSVGElement);
    let ft = svg.freeTransform(el);
    ft.attrs.translate.x = ulx;
    ft.attrs.translate.y = uly;
    ft.hideHandles();
    ft.apply();
    return ft;
}

/**
 * Get the bounding box of a rectangle anchored at a particular corner.
 *
 * @method getBBox
 * @param {int} x Reference X
 * @param {int} y Reference Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {String} corner Which corner `x` and `y` relate to.
 *                        Must be `[TMB][LCR]`.
 * @return {Object} {ulx, uly, w, h, corner, cx, cy, cornerX, cornerY}.
 */
function getBBox(x, y, w, h, corner) {
    // Get the upper-left corner
    let ulx, uly;
    if (corner.includes("l")) {
        ulx = x;
    } else if (corner.includes("c")) {
        ulx = x - w / 2;
    } else if (corner.includes("r")) {
        ulx = x - w;
    } else {
        throw "corner must specify l, c, or r";
    }

    if (corner.includes("t")) {
        uly = y;
    } else if (corner.includes("m")) {
        uly = y - h / 2;
    } else if (corner.includes("b")) {
        uly = y - h;
    } else {
        throw "corner must specify t, m, or b";
    }

    let cx = ulx + w / 2;
    let cy = uly + h / 2;
    return { ulx, uly, w, h, corner, cx, cy, cornerX: x, cornerY: y };
}

/**
 * Position a group that contains baseline-aligned text starting at y=0 to
 * start (end) at (x, uly).
 *
 * @method positionGroupAt
 * @param {Snap object} group The group containing the text
 * @param {Snap object} text The text
 * @param {int} x Upper-left X, or upper-right x if opts.ralign
 * @param {int} uly Upper-left Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {Object} opts Options:
 *  - ralign to right-align the text
 */
function positionGroupAt(group, text, x, uly, w, h, opts = {}) {
    const ulx = opts.ralign ? x - w : x;
    const svg = Snap(group.node.ownerSVGElement);
    let ftg = svg.freeTransform(group);
    let ftt = svg.freeTransform(text);
    [ftg, ftt].map((o) => {
        o.hideHandles();
    });

    // Position the element
    // Add the element off-screen so we can find out where it is.
    ftg.attrs.translate.x = -1000;
    ftg.attrs.translate.y = -1000;
    ftg.apply();
    const where = group.getBBox();

    // Get the baseline location.  E.g., top = -1010 means
    // the top is 10px above the baseline === baseline is 10px below
    // the top.
    const dyTopToBaseline = ftg.attrs.translate.y - where.y;

    // Center textGroup vertically within element
    const vmargin = h - where.height;

    // Move the element horizontally, left-justified
    // E.g., where.left = -1010 => move position.x +10 (right)
    ftt.attrs.translate.x = ftg.attrs.translate.x - where.left;
    ftt.attrs.translate.y = vmargin / 2;
    ftt.apply();

    ftg.attrs.translate.x = ulx;
    ftg.attrs.translate.y = uly + dyTopToBaseline;
    ftg.apply();

    // Return the coordinates of the top-left corner of the group with respect
    // to the group itself (since the group's y=0 is the text baseline).
    return {
        xInGroup: 0,
        yInGroup: -dyTopToBaseline,
    };
}

/**
 * Return a text color contrasting with the given color
 *
 * @method getContrastingTextColor
 * @param {string} color The color, as a hex string, e.g., `#123456`.
 */
function getContrastingTextColor(color) {
    if (WcagContrast.hex(color, "#000") > WcagContrast.hex(color, "#fff")) {
        return "#000";
    } else {
        return "#fff";
    }
}

module.exports = {
    extend,
    freeTransformTo,
    getBBox,
    positionGroupAt,
    getContrastingTextColor,
};
