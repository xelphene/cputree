
'use strict';

const og = require('octogeom');

const {input, subobj, reflectParent, parent} = require('../');

var M = {
    input: {},
    front: {
        neck: {}
    },
};

M.front.neck.$ = function () { return this[parent][parent] };

// OK
//M.front.neck.radius = function () { return this[parent][parent].input.neckHoleRadius; };


module.exports = M;
