
'use strict';

const {
    ObjNode,InputNode, parent,
    ComputeNode, mioMapOut,
} = require('../');
const {getMapOut} = require('../').mio;

function getTestLib () {
    var r = new ObjNode({});
    
    r.add('inp0', new InputNode({}));
    
    r.add('s', new ObjNode({}));
    r.getProp('s').add('c0', new ComputeNode({
        computeFunc: function () {
            return this[parent].inp0+1
        }
    }));
    r.getProp('s').add('i', new InputNode({}));
    r.getProp('s').add('j', new ComputeNode({
        computeFunc: () => 3
    }));
    r.add('j', new InputNode({}));
        
    return r;
}


var root = new ObjNode({});
root.add('orig', getTestLib());
root.addc('mb', getMapOut(root.getc('orig')) );
root.getc('mb').getc(mioMapOut).computeFunc = function () {
    return x => x + this[parent].xf;
};

root.add('xf', new InputNode({}));
root.finalizeEntireTree();
root.getProp('xf').value = 10;
root.getProp('orig').getProp('inp0').value = 100;
root.getProp('orig').getProp('s').getProp('i').value = 202;
root.getProp('orig').getProp('j').value = 303;
console.log('######');
root.computeIfNeeded();
root.logStruct();

// all values in root.mb.* should be root.orig.* + 10

console.log('------------');

console.log(root.rawObject);
