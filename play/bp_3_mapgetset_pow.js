
'use strict';

const {tbuild, unwrap, tinsert, bexist} = require('../tbuild');

var R = tbuild();

// TODO: also make a simple input symbol

R.o = bexist;
R.o.i = tinsert.input(2);
R.o.f = t => 4;
R.pow = tinsert.input(3);

//R.mp = tinsert.powMap( R.o, R.pow ); // works
//R.mp = tinsert.powMap( R.o, t => t.pow ); // works
//R.mp = tinsert.powMap( R.o, 3 ); // TODO

//R.ml  = tinsert.map( R.i, (t,v) => -v );

R.mp = bexist;
R.mp.i = tinsert.powMap( R.o.i,  t => t.pow ); // works
//R.mlp = tinsert.powMap( R.i,  R.pow ); // works


////////////////////////////

R = unwrap(R);
R.init({});
console.log( R.rawObject );

console.log('---   set mp.i = 3000');

R.rawObject.mp.i = 3000;
console.log( R.rawObject );

console.log('---   set pow = 2');

R.rawObject.pow = 2;
console.log(R.rawObject);

console.log('='.repeat(80));

R.logDebug();

