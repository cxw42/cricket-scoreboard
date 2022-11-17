// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause

let Two = require('two.js');

/**
 * A text box anchored at one corner
 *
 * @class Textbox
 * @constructor
 * @param {Two} two The scene
 * @param {int} x Corner X
 * @param {int} y Corner Y
 * @param {int} w Width
 * @param {int} h Height
 * @param {String} corner Which corner `x` and `y` relate to.
 *                        Must be `[TMB][LCR]`.
 * @param {Object} styles Styles per [Two.Text](https://two.js.org/docs/text/)
 */
class Textbox {
    // two.js coordinates
    twoX;
    twoY;

    group;
    outline;
    text;

    constructor(x, y, w, h, corner = 'tl', styles = {}) {
        corner = corner.toLowerCase();

        if (corner.includes('t')) {
            this.twoY = y + h / 2;
        } else if (corner.includes('m')) {
            this.twoY = y;
        } else if (corner.includes('b')) {
            this.twoY = y - h / 2;
        } else {
            throw "corner must specify t, m, or b";
        }

        if (corner.includes('l')) {
            this.twoX = x + w / 2;
        } else if (corner.includes('c')) {
            this.twoX = x;
        } else if (corner.includes('r')) {
            this.twoX = x - w / 2;
        } else {
            throw "corner must specify l, c, or r";
        }

        this.text = new Two.Text('', this.twoX, this.twoY, styles);
        this.outline = new Two.Rectangle(this.twoX, this.twoY, w, h);
        this.outline.fill = 'none';
        this.group = new Two.Group(this.outline, this.text);
    }

    addTo(two) {
        this.group.addTo(two)
    }

    setValue(value) {
        this.text.value = value;
    }

};

module.exports = Textbox;
