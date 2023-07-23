
'use strict';

const {
    ObjNode,InputNode, parent, bexist,
    ComputeNode, mioMapOut, mioSrcBranch
} = require('../');
const {tMerge} = require('./merge');

var rootBase = new ObjNode({});
var pBase    = rootBase.getConProxy();
var rootInc  = new ObjNode({});
var pInc     = rootInc.getConProxy();

pBase.c1 = () => 'pBase c1';
//pBase.c2 = () => 'pBase c2';
pBase.o1 = bexist;
pBase.o1.a = new InputNode({});
pBase.o1.b = () => 2;
pBase.c3 = () => 'pBase c3';
//pBase.c4 = bexist;

pInc.c1 = new InputNode({});
pInc.c2 = () => 'pInc c2';
pInc.o1 = bexist;
pInc.o1.a = () => 222;
pInc.o1.b = new InputNode({});
pInc.o2 = bexist;
pInc.o2.o2c = () => 'o2 child';
//pInc.c3 = bexist;
pInc.c4 = () => 2;

//tMerge(rootBase, rootInc);
rootBase.merge(rootInc);

console.log('-----------');

rootBase.logStruct();
