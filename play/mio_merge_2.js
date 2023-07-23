
const {ObjNode, C, N, InputNode, mio, bexist} = require('../');
const {getMapBiReplace} = mio;

function getSomeBrAB() 
{
    var abroot = new ObjNode({})[C];
    abroot.i = new InputNode({});
    abroot.a = function () { return this.i + 1 };
    abroot.b = function () { return this.i + 3 };
    return abroot[N];
}

function getSomeBrCD() 
{
    var cdroot = new ObjNode({})[C];
    cdroot.i = new InputNode({});
    cdroot.c = function () { return this.i + 5 };
    cdroot.d = function () { return this.i + 7 };
    return cdroot[N];
}


var root1 = new ObjNode({})[C];
root1.p = bexist;
root1.n = bexist;
root1.p[N].merge( getSomeBrAB() );
root1.n[N].merge( getMapBiReplace(getSomeBrAB()) );

var root2 = new ObjNode({})[C];
root2.p = bexist;
root2.n = bexist;
root2.p[N].merge( getSomeBrCD() );
root2.n[N].merge( getMapBiReplace(getSomeBrCD()) );

var root = new ObjNode({});
root[N].mergeOpts = {leafConflict: 'keepBase'};
root.merge(root1[N]);
root.merge(root2[N]);

root.logStruct();
