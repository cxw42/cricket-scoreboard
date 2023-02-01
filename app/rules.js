// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

// rules.js: Items related to the rules of the game

/**
 * Markers: single-character flags indicating the type of delivery.
 *
 * If no markers are present, any runs scored are regular runs from a
 * legal delivery.
 *
 * There is no marker for 4s or 6s.
 *
 * @class Marker
 */
class Marker {
    static BYE = new Marker("B", "b");
    static LEG_BYE = new Marker("L", "lb");
    static NO_BALL = new Marker("N", "nb");
    static WICKET = new Marker("W", "W");
    static WIDE = new Marker("D", "wd");

    constructor(key, label) {
        this.key = key;
        this.label = label;
    }

    foundIn(arr) {
        if (typeof arr !== typeof []) {
            return false;
        }

        for (const m of arr) {
            if (m.key == this.key) {
                return true;
            }
        }
        return false;
    }
}

module.exports = {
    Marker,
};
