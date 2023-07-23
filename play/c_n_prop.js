
'use strict';

const {
    ObjNode, C, N, bexist
} = require('../');

var r = new ObjNode({});

r[C].b = bexist;
r[C].b.f = () => 222;

r[C].b2 = bexist;
r[C].b2.f = () => 333;
r[C].b2.f2 = () => 334;

r[N].finalizeEntireTree();
r[N].computeIfNeeded();

r[N].logFlat();
