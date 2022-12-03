// cricket-scoreboard
// Copyright (c) 2022 Christopher White
// SPDX-License-Identifier: BSD-3-Clause
"use strict";

/**
 * A team in a match
 *
 * @class Team
 * @constructor
 */
class Team {
    /**
     * The team's name
     *
     * @property name
     */
    name = "Unknown";

    /**
     * The team's abbreviation
     *
     * @property abbrev
     */
    abbrev = 'UNK';

    /**
     * The team's main color.
     *
     * This should ideally be the team's primary jersey color, or some other
     * readily identifiable color.
     *
     * @property color
     */
    color = "#5784E4";

    /**
     * Batters.
     *
     * Map from name to TODO.
     *
     * @property batters
     */
    batters = {};

    /**
     * Bowlers.
     *
     * Map from name to TODO.
     *
     * @property bowlers
     */
    batters = {};

    constructor(name, abbrev, color) {
        if (name) {
            this.name = name;
        }
        if (abbrev) {
            this.abbrev = abbrev;
        }
        if (color) {
            this.color = color;
        }
    }
};

module.exports = Team;
