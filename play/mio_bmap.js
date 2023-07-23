
'use strict';

const {
    ObjNode,InputNode, parent, bmap,
    buildMioTree,
    ComputeNode,
} = require('../');
const {getMapOutBCF} = require('../').mio;

var root = new ObjNode({});
root.add('o', new ObjNode({}));
root.getProp('o').add('c', new ComputeNode({
    computeFunc: () => 222
}));
root.getProp('o').add('i', new InputNode({}));
root.getProp('o').add('s', new ObjNode({}));
root.getProp('o').getProp('s').add('sc', new ComputeNode({
    computeFunc: () => 111
}));

var mb = getMapOutBCF(
    function () {
        return this.o[bmap](
            v => v + this.xf
        )
    }
);
root.add('mb', mb);

root.add('xf', new InputNode({}));
root.finalizeEntireTree();
root.getProp('xf').value = 10;
root.getProp('o').getProp('i').value = 3;
console.log('######');
root.computeIfNeeded();
root.logStruct();


console.log('------------');

//root.getProp('xf').value = 10;
root.getProp('o').getProp('i').value = 4;
root.computeIfNeeded();
root.logStruct();

console.log('------------');

console.log(root.rawObject);
