// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Snap = require("snapsvg");
const Utils = require("utils");
require("3rdparty/snap.svg.free_transform");

/**
 * A shape anchored at a point.
 *
 * @class Shape
 * @constructor
 * @param {Snap} svg The SVG
 * @param {int} x Reference X
 * @param {int} y Reference Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {String} corner Which corner `x` and `y` relate to.
 *                        Must be `[TMB][LCR]`.
 * @param {Object} [opts] Options
 * @param {Object} [opts.showCorner] If truthy, visibly mark (x,y).
 */
class Shape {
    /**
     * The SnapSVG instance we belong to
     *
     * @protected
     * @property svg
     */
    svg = null;

    /**
     * Our bounding box
     *
     * @protected
     * @property bbox
     */
    bbox = {};

    /**
     * Original values requested by the user
     *
     * @protected
     * @property origBBox
     */
    origBBox = {};

    /**
     * Our top-level SVG element.
     *
     * Anything added by a subclass should be added to this group.
     *
     * @protected
     * @property group
     */
    group = null;

    /**
     * The free transform for `group`.
     *
     * You can use this to move, rotate, &c. the Shape as a whole.
     *
     * @protected
     * @property ft
     */
    ft = null;

    //outline; // visible outline --- TODO addme?

    constructor(svg, x, y, w, h, corner, opts) {
        opts = opts || {};
        this.svg = svg;
        this.group = svg.g();
        this.group.addClass(this.constructor.name);
        this.bbox = Utils.getBBox(x, y, w, h, corner);
        this.origBBox = structuredClone(this.bbox);
        this.ft = Utils.freeTransformTo(
            this.group,
            this.bbox.ulx,
            this.bbox.uly
        );

        svg.add(this.group);

        if (opts.showCorner) {
            const marker = svg.circle(
                this.bbox.cornerDX,
                this.bbox.cornerDY,
                2
            );
            marker.attr({
                fill: "#f00",
                stroke: "none",
            });
            this.group.add(marker);
        }
    }

    /**
     * Add this instance to an SVG element
     *
     * @method addTo
     * @param {Object} parent The element
     */
    addTo(parent) {
        if (parent instanceof Shape) {
            parent.group.add(this.group);
        } else {
            parent.add(this.group);
        }
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
     * Move this shape, or update our record of its size.
     * Note that this doesn't actually change the size.
     *
     * @method setBBox
     */
    setBBox(x, y, w, h, corner) {
        this.bbox = Utils.getBBox(x, y, w, h, corner);
        this.ft.attrs.translate.x = this.bbox.ulx;
        this.ft.attrs.translate.y = this.bbox.uly;
        this.ft.apply();
    }
}

module.exports = Shape;
