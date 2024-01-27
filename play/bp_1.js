
'use strict';

const {tbuild, unwrap, tinsert, bexist} = require('../tbuild');

var R = tbuild();

R.i  = tinsert.input(0.222);
R.c  = t => 222;
R.md = t => 2;
R.f1 = t => t.c + 1;
R.f2 = t => t.i*10000;

R.o = bexist;
R.o.i = tinsert.input(9);
R.o.f = t => t.i + t.o.i;

R.m = tinsert.map( R.o, (t,v) => v * t.md );


R = unwrap(R);
R.init({});

R.logDebug();

/*
R.i = ct.tree.input(0.1); // tinsert func
R.j = ct.tree.input(0.2); // tinsert func

// tinsert func
// R's default bindings are NOT used
R.c = ct.tree.bind( [R.i, R.j],  (i,j) => (i+j) * 10 );

R.bigij = t => 1000 + i + j

// GetSet via tinsert func
R.s = ct.acc(
    t => -t.i,
    (t,v) => { t.i = -v }
);

R.s[nget] = t => -t.i
R.s[nset] = (t,v) => { t.i = -v }

// returns an ANode/Get. does nothing to the tree R.
// different from ct.tree.bind, which is a tinsert func
var anonNone = ct.bind( [R], t => t.i * 10 );

// tinsert func
// R's default bindings are NOT used
R.a = ct.tree.bind(
    [R, anonNode], (t, an) => an * 10 + t.j
);

// returns an ANode/Get. does nothing to the tree R.
var mapFuncNode = ct.bind(
    [R, R.getc('c')], (t,c) => v => t.j * v - c
);
// TNode/Get
R.m = ct.tree.map( mapFuncNode, R.a );

// ct.tree.map *is* a tinsert func
// R's bindings ARE applied to this plain func
R.map_simple = ct.tree.map( mapFuncNode, (t,v) => -v );
*/
