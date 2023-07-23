
'use strict';

const {
    C, N, O, ObjNode, InputNode,
    bexist,
    mio, mioSrcBranch, mioMapIn, mioMapOut
} = require('../');

const {
    getMioMerge2, initDst
} = require('../').mio.merge2;

function getSomeBrAB() 
{
    var abroot = new ObjNode({})[C];
    abroot.i = new InputNode({});
    abroot.j = new InputNode({});
    abroot.a = function () { return this.i + 1 };
    abroot.b = function () { return this.i + 3 };
    return abroot[N];
}

function getSomeBrCD() 
{
    var cdroot = new ObjNode({})[C];
    cdroot.i = new InputNode({});
    cdroot.j = function () { return 999 };
    cdroot.c = function () { return this.i + 5 };
    cdroot.d = function () { return this.i + 7 };
    return cdroot[N];
}

var root = new ObjNode({})[C];
root.p = bexist;
root.p[N].merge( getSomeBrAB() );
root.p[N].merge( getSomeBrCD() );

root.n = bexist;
root[mioSrcBranch] = bexist;
root[mioMapIn]  = function () { return n => -n; }
root[mioMapOut] = function () { return n => -n; }

root.n[N].merge( getMioMerge2( getSomeBrAB() ) );
root.n[N].merge( getMioMerge2( getSomeBrCD() ) );

root[N].init({
    p: {i: 10},
    n: {i: -10}
});
root[N].logFlat();
