
'use strict';

const {
    ObjNode,InputNode, parent,
    ComputeNode, mioMapIn, mioMapOut,
} = require('../');
const {getMapBiReplace} = require('../').mio;

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
/*
var mb = mapBranchReplace({
    srcBranch: root.getProp('orig'),
    mapIn: function () {
        return x => -x;
    },
    mapOut: function () {
        //return x => -x; // WORKS
        return x => x + this[parent].xf; // WORKS
    },
});
root.add('mb', mb);
*/
root.addc('mb', getMapBiReplace(root.getc('orig')) );
root.getc('mb').getc(mioMapIn).computeFunc = function () {
    return x => -x 
};
root.getc('mb').getc(mioMapOut).computeFunc = function () {
    return x => x + this[parent].xf
};


root.add('xf', new InputNode({}));
root.finalizeEntireTree();
root.getProp('xf').value = 10;
root.getProp('mb').getProp('inp0').value = 100;
root.getProp('mb').getProp('s').getProp('i').value = 202;
root.getProp('mb').getProp('j').value = 303;
console.log('######');
root.computeIfNeeded();
root.logStruct();
// root.mb.s.c0 == -89 == -root.mb.inp0 + 1 + xf
// root.mb.j == 303 == -root.mb.j 

console.log('------------');

root.getProp('xf').value = 20;
root.computeIfNeeded();
root.logStruct();
// root.mb.s.c0 == -79 == -root.mb.inp0 + 1 + xf

console.log('------------');

root.getProp('mb').getProp('inp0').value = 101;
root.computeIfNeeded();
root.logStruct();
// root.mb.s.c0 == 80 == -root.mb.inp0 + 1 + xf

console.log('------------');

console.log(root.rawObject);
