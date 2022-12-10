// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

const Snap = require('snapsvg');
const Utils = require('utils');
require('3rdparty/snap.svg.free_transform');

/**
 * A text box anchored at a point
 *
 * @class Textbox
 * @constructor
 * @param {Snap} svg The SVG
 * @param {int} x Reference X
 * @param {int} y Reference Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {String} corner Which corner `x` and `y` relate to.
 *                        Must be `[TMB][LCR]`.
 * @param {Object|Array[Object]} textAndStyles
 * @param {Object} styles Styles per [Two.Text](https://two.js.org/docs/text/),
 *                        plus 'bgFill' which, if set, is used as a background
 *                        fill.
 */
class Textbox {
    // two.js coordinates
    twoX;
    twoY;

    group; // the group of shapes
    outline; // visible outline
    text; // Two.Text instance

    constructor(svg, x, y, w, h, corner, textAndStyles) {
        if (typeof(textAndStyles) !== typeof([])) {
            textAndStyles = [textAndStyles];
        }

        /*  // TODO
        // Clone the styles since we are going to change params
        let bgFill = styles['bgFill'] || 'none';
        styles = structuredClone(styles);
        delete styles['bgfill'];
        */

        // always put the text on the baseline
        let localStyles = {};
        localStyles.baseline = 'baseline';

        corner = corner.toLowerCase();

        // Get the upper-left corner
        let ulx, uly;
        if (corner.includes('l')) {
            ulx = x;
            localStyles.alignment = 'start';
        } else if (corner.includes('c')) {
            ulx = x - w / 2;
            localStyles.alignment = 'middle';
        } else if (corner.includes('r')) {
            ulx = x - w;
            localStyles.alignment = 'end';
        } else {
            throw "corner must specify l, c, or r";
        }

        if (corner.includes('t')) {
            uly = y;
        } else if (corner.includes('m')) {
            uly = y - h / 2;
        } else if (corner.includes('b')) {
            uly = y - h;
        } else {
            throw "corner must specify t, m, or b";
        }

        // Create a temporary canvas we will use
        let canvas = Snap();
        canvas.hide();

        // Create the group and position it at the given place
        this.group = svg.g();
        let ftg = svg.freeTransform(this.group);
        ftg.hideHandles();
        ftg.attrs.translate.x = ulx;
        ftg.attrs.translate.y = uly;
        ftg.apply();

        // Create the text and position it horizontally
        localStyles['text-align'] = localStyles['text-anchor'] =
            localStyles.alignment;
        this.text = svg.text(0, 0,
            textAndStyles.map((o) => Utils.extend(o.text, localStyles))
        );
        const kids = this.text.children();
        for (let i = 0; i < textAndStyles.length; ++i) {
            kids[i].attr(
                Utils.extend(textAndStyles[i].styles || {}, localStyles)
            );
        }


        // Position the text
        const where = this.text.getBBox();
        let ftt = svg.freeTransform(this.text);
        ftt.hideHandles();
        ftt.attrs.translate.x = x - ulx;

        let translateY;
        if (corner.includes('t')) {
            translateY = -where.y; // shift baseline down
        } else if (corner.includes('m')) {
            translateY = h / 2 - where.cy;
        } else if (corner.includes('b')) {
            translateY = h - where.y2;
        }

        ftt.attrs.translate.y = translateY;
        ftt.apply();

        this.group.add(this.text);

        // Outline
        this.outline = svg.rect(0, 0, w, h)
            .attr({
                fill: 'none', // XXX bgFill,
                stroke: 'none', // XXX '#0ff'
            });
        this.group.add(this.outline);

        // Copy the group to `svg`
        svg.add(this.group);
        canvas = null;
    }

    addTo(el) {
        el.add(this.group);
    }

    setValue(value) {
        this.text.attr({
            text: value
        });
    }

};

module.exports = Textbox;
