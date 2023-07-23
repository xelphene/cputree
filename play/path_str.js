
'use strict';

const {Path, parent} = require('../');

var p1 = new Path(['a','b','c']);
console.log(p1.hasOnlyStrParts);

var p2 = new Path(['a',parent,'b','c']);
console.log(p2.hasOnlyStrParts);

