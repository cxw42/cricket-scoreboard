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
const Marker = Object.freeze({
    BYE: "B",
    LEG_BYE: "L",
    NO_BALL: "N",
    WICKET: "W",
    WIDE: "D",
});

module.exports = {
    Marker,
};
