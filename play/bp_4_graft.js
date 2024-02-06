
'use strict';

const {tbuild, unwrap, tinsert, bexist} = require('../tbuild');

function getTree() {
    var S = tbuild();
    S.i = tinsert.input(222);
    S.c = t => t.i + 1;
    return S;
}

var R = tbuild();

R.i = tinsert.input(2);
R.c = t => t.i * 10;

R.s = getTree();
R.s2 = R.s;

////////////////////////////

R = unwrap(R);
R.init({});
console.log( R.rawObject );
/*
console.log('---   set mp.i = 3000');

R.rawObject.mp.i = 3000;
console.log( R.rawObject );

console.log('---   set pow = 2');

R.rawObject.pow = 2;
console.log(R.rawObject);

console.log('='.repeat(80));

*/
R.logDebug();
