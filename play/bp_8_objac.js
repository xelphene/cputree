
'use strict';

const {Node, TInputNode, TGetNode} = require('../node');
const {TreeFiller} = require('../tbuild/fill');
const {nget, nset} = require('../consts');
const {tbuild, unwrap, tinsert, bexist, tinput} = require('../tbuild');
const {predFunc} = require('../');

var T = tbuild();
T.s.c = () => 222;
T.s.d = () => 333;
T.s.o = () => 1;
T.c = t => {
    let sum = 0;
    //console.log(t.s);
    //console.log( Object.values(t.s) );
    return Object.values(t.s).reduce( (a,b) => a+b );
}

T = unwrap(T);
T.init();
var t = T.rawObject;

T.logDebug();
T.logFlat();
