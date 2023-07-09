# cricket-scoreboard
# Copyright (c) 2022--2023 Christopher White
# SPDX-License-Identifier: BSD-3-Clause
#
# Convenience Makefile

# default target
.PHONY: start
start:
	npm start

# Pretty-print
.PHONY: p
p:
	npm run p

# Generate docs
.PHONY: doc html
doc: html
html:
	npm run doc
