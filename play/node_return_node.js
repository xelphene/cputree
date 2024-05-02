
'use strict';

const {N, isDTProxy} = require('../consts');
const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');

var T = tbuild();

T.s.a = () => 222;
T.s.b = tinput.any();
T.s.s2.c = () => 0.1;

T.r = t => t.s;
//T.r = T.s;

//T.p.c = t => t.s.a + t.s.b;
T.p.x = t => t.r.a + t.r.b;
T.p.y = t => t.r.a + t.r.b + t.r.s2.c;

//T.q.x = t => t.s.a + t.s.b;
//T.q.y = t => t.s.a + t.s.b + t.s.s2.c;

T = unwrap(T);
T.init({
    s: { b: 10 }
});
var t = T.rawObject;

T.logDebug();
T.logFlat();

console.log('---');

console.log( t.p.y );
t.s.b = 100;
console.log( t.p.y );
console.log( t.r[N].fullName );
console.log( t.r );
console.log( t.r[isDTProxy] );
