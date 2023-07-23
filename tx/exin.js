
'use strict';

const {ObjNode, bexist, inpdef, parent, InputNode} = require('gobj4');

function getTree () 
{
    var root = new ObjNode({});
    var p = root.C;
    
    root.addSliderKey('$');
    p.ia = new InputNode({});
    p.f1 = function () {
        return this.ia+1;
    };
    p.s = bexist;
    p.s.e1 = function () {
        return this[parent].f1+2;
    }
    p.s.e2 = function () { return 222 };
    p.s.t = bexist;
    p.s.t.g1 = function () {
        return this.$.ia*100;
    }
    p.s.t.g2 = function () {
        return 999;
    }
    p.s.t.g3 = function () {
        return this[parent].e2 * 10;
    }

    root.finalizeEntireTree();
    root.applyInput({ia:10});
    root.computeIfNeeded();
    
    root.logFlat();
    
    return root;
}
exports.getTree = getTree;

if( require.main === module )
    getTree();

