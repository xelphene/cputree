
'use strict';

const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');

var Q = tbuild();
Q.oq.i = tinput.any(4);
Q.qc = t => t.oq.i ** 2;

var R = tbuild();
R.inc = tinput.any(1);
R.m = tinsert.mapBi( Q, (t,v) => v + t.inc, (t,v) => v - t.inc, {
    graft: false
});

Q = unwrap(Q);
R = unwrap(R);
Q.init({});
R.init({});
R.logDebug();

console.log('='.repeat(40));

Q.nav('oq.i').setValue(5);
R.computeIfNeeded();
R.logDebug();

console.log('%'.repeat(40));

R.nav('m.oq.i').setValue(7);
R.computeIfNeeded();
R.logDebug();
