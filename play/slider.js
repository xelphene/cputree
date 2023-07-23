
'use strict';

const {
    ObjNode, AliasValidateNode, InputNode, ComputeNode,
} = require('../');

var root = new ObjNode({});

root.add('sub', new ObjNode({}));
root.getProp('sub').add('cn',
    new ComputeNode({
        computeFunc: () => 222
    })
);

var sk = Symbol('SK');
root.getProp('sub').addSliderKey(sk);

root.getProp('sub').add('sub2', new ObjNode({}));

root.getProp('sub').getProp('sub2').add('c', new ComputeNode({
    computeFunc: function () {
        return this[sk].cn;
    }
}));

///////////////

root.finalizeEntireTree();

//root.logStruct();
root.computeIfNeeded();
console.log('---');
root.logStruct();

