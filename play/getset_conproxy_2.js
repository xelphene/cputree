
'use strict';

const {
    ObjNode, C, N, O, bexist, InputNode, GetSetNode,
    nget, nset,
} = require('../');

var r = new ObjNode({});
var R = r[C];
var o = r[O];

R.sub.f2 = () => 's222';

R.inp = new InputNode({});

// done: make this optional
//R.gs = new GetSetNode({});
R.gs[nset] = function (v) {
    console.log(`in gs setter. v=${v}`);
    this.inp = v+10;
}
R.gs[nget] = () => {
    console.log('gs getter called');
    //throw new Error('blah');
    return 222;
}

// TODO: make this optional
R.a.b.gs = new GetSetNode({});
R.a.b.gs[nget] = () => 222.2;

R.f = function () {
    //this.inp = 2;
    return this.inp+1;
}

r.init({
    inp: 1
});

r.logFlat();

console.log('---');

//r.getc('gs').setValue(900);
o.gs = 900;

//r.computeIfNeeded();
console.log('-');
r.logStruct();
//o.inp = 10;
console.log('---');
console.log(o.f);
console.log('---');
r.logFlat();
