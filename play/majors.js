
'use strict';

const {ObjNode, MAJORS, bexist, toPath} = require('../');

var root = new ObjNode({});
var p = root.getConProxy();

var S = Symbol('S');

p.blah = () => 123;
p.mmm = () => 222;
p.sub1 = bexist;
p.sub1.inner1 = () => 333;
p.sub1.innerM = () => '222_1';

p[S] = bexist;
p[S].symBlah = () => 'sym blah';
p[S].symMajor = () => 'sym MAJOR';

p[S][MAJORS] = [
    //p[S].symBlah,
    'symBlah',
];

p[MAJORS] = [
    //p.mmm,
    'mmm',
    //p.sub1.innerM,
    'sub1.innerM',
    //p[S].symMajor,
    toPath([S, 'symMajor']),
];

console.log('>>> root majors');
for( let n of root.iterTreeMajors() )
    console.log(n.fullName);

console.log('>>> root[S] majors');
for( let n of root.getc(S).iterTreeMajors() )
    console.log(n.fullName);

