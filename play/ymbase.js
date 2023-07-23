
'use strict';

const {
    tmpl, bmap, bfunc, parent, get, CTL,
    ObjNode, InputNode, ComputeNode
} = require('../');

var root = new ObjNode({});

var sa = new ObjNode({});
root.add('sa',sa);

var saa = new ObjNode({});
root.getProp('sa').add('saa',saa);
var saa_inp = new InputNode({});
saa.add('saa_inp', saa_inp);

var sb = new ObjNode({});
root.add('sb',sb);

var sbb = new ObjNode({});
root.getProp('sb').add('sbb',sbb);

sbb.add('c1_saa', new ComputeNode({
    computeFunc: function () {
        return this[get](saa_inp)+1;
    }
}));
sbb.add('c2_saa', new ComputeNode({
    computeFunc: function () {
        return this[get](saa).saa_inp * 10;
    }
}));

root.finalizeEntireTree();
saa_inp.value = 221;
root.computeIfNeeded();



root.logStruct();
