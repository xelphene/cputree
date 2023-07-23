
'use strict';

const {
    ObjNode, C, N, O, bexist, InputNode, GetSetNode
} = require('../');

var r = new ObjNode({});
var R = r[C];
var o = r[O];

R.sub.f2 = () => 's222';

R.inp = new InputNode({});
r.addc('gs', new GetSetNode({}) ); // TODO: make conproxy work
r.getc('gs').computeFunc = () => {
    console.log('gs getter called');
    //throw new Error('blah');
    return 222;
}
r.getc('gs').setFunc = function (v) {
    console.log(`in gs setter. v=${v}`);
    this.inp = v;
}
R.f = function () {
    //this.inp = 2;
    return this.inp+1;
}

r.init({
    inp: 1
});

r.logFlat();

console.log('---');

r.getc('gs').setValue(900);
//r.computeIfNeeded();
console.log('-');
r.logStruct();
//o.inp = 10;
console.log('---');
console.log(o.f);
