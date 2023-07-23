
'use strict';

const og = require('octogeom');
const {input, subobj, reflectParent, sub, parent} = require('../');

var M = {
    input: {
        neckHoleRadius: input (),
    },
    front: {
        neck: {}
    },
};


module.exports = M;
