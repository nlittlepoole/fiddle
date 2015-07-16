#!/bin/bash
rm compiled.js
touch compiled.js

cat fiddle.js >> compiled.js
cat modules/*.js >> compiled.js