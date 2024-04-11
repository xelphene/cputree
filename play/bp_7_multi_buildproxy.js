
'use strict';

const {Node, TInputNode, TGetNode} = require('../node');
const {TreeFiller} = require('../tbuild/fill');
const {nget, nset} = require('../consts');
const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');
const {predFunc} = require('../');

var T = tbuild();
T.p = () => 10;
T.unit = tinput.string();
T.s = bexist;
T.s.c = () => 222;

//T.s2 = bexist;

//var S2 = tbuild(T.s2, {bind:[ T, T.s ]});
var S2 = tbuild(T.s2, [ T, T.s ]);
S2.c = (t,s) => t.p + s.c + t.s2.C;
S2.C = () => 100;
T.s2 = S2;

T = unwrap(T);
T.init({unit: 'in'});
var t = T.rawObject;

//T.logDebug();
T.logFlat();
