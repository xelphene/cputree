
/*

Each of these takes a source branch, srcBranch, and builds a new branch, the
mapBranch.  mapBranch will have an identical structure to srcBranch, but
every leaf node value in srcBranch will a map function applied to it.

srcBranch can be elsewhere already in the tree being assembled or completely
outside of it.  If outside, srcBranch will be added as a [mioSrcBranch] child to the
map root.

mapIn and mapOut are functions.  These functions will be the computeFunc of
new GetSetNodes at mapBranch.[mapIn] and mapBranch.[mapOut], respectively. 
Each function must return another function, the mapFunc, which maps values
between srcBranch and mapBranch.  Said functions will be provided with on
argument: the value to be mapped, and should return the desired value.

'this' within mapIn and mapOut will be mapRoot.


///////////////////////////////////

getMapBiLink({srcBranch, mapIn, mapOut})
buildMapBiLink({mapBranch, srcBranch, mapIn, mapOut})

new compute nodes which apply mapIn will be created at mapRoot.[mioInput].

input nodes in orig will be linked to the above nodes.

no nodes in orig will be replaced.  the only modifications will be the input
linking above.


///////////////////////////////////

getMapBiReplace({srcBranch, mapIn, mapOut})
buildMapBiReplace({mapBranch, srcBranch, mapIn, mapOut})

input nodes in orig will be replaced with GetSetNodes that apply mapIn.


///////////////////////////////////

getMapOut({srcBranch, mapOut})
buildMapOut({mapBranch, srcBranch, mapOut})

mapOut will be applied to every node in orig. orig is left completely untouched.


///////////////////////////////////

getMapOutBCF({branchComputeFunc})
buildMapOutBCF({mapBranch, branchComputeFunc})

this exists to make the following conproxy syntax possible:

p.origBranch = bexist;
p.origBranch.cn = () => 10;
p.mapBranch = function () {
    return this.origBranch[bmap](
        x => x+1
    )
};
p.mapBranch[bfunc] = true;
// mapBranch.cn == 11

branchComputeFunc will be called immediately and it must return a MapDef.
'this' in branchComputeFunc will be a DTProxy over mapRoot's parent.

the MapDef.mapFunc will be applied to every node in the orig (MapDef.node)


*/

/////////////////////////////////////////////////////////

'use strict';

const {
    mioSrcBranch, mioMapIn, mioMapOut, mioInput,
    parent, bexpand,
} = require('../consts');
const {ObjNode, GetSetNode, InputNode, MapNode} = require('../node');
const {getDTProxyHandler} = require('../node/sproxy');
const {toPath} = require('../path');


/////////////////////////////////////////////////////////

function fillInputLeaf(mapBranch, srcBranch)
{
    for( let i of srcBranch.iterTreeInput() )
    {
        //console.log(`found input ${i.fullName} depth ${i.depth}`);
        //console.log(i.keyPath);
        
        let iParent = i.parent;
        let iKey = i.key;
        
        let mapBranchInputPath = toPath( i.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( z => z.key ) );
        //console.log(`  mapBranchInputPath: ${mapBranchInputPath}`);
        let mapBranchInputNode = mapBranch.addNodeAtPath(mapBranchInputPath, i.copyNode());

        let mioInputPath = toPath(i.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( z => z.key ))
            .prepend(mioInput);
        let mioInputNode = mapBranch.addNodeAtPath(mioInputPath, new MapNode({}));
        mioInputNode.setSrcByNode( mapBranchInputNode );
        mioInputNode.setMapFuncByNode( mapBranch.getProp(mioMapIn) );
        
        i.linkToNode( mioInputNode );
    }
}

function replaceInputLeaf(mapBranch, srcBranch)
{
    for( let i of srcBranch.iterTreeInputUnlinked() )
    {
        let iParent = i.parent;
        let iKey = i.key;
        //let newPath = i.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( z => z.key );
        let newPath = toPath( i.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( z => z.key ) );

        //let newInput = mapBranch.addDeep(newPath, i.copyNode()); // TODO: replace with addNodeAtPath
        let newInput = mapBranch.addNodeAtPath(newPath, i.copyNode());

        iParent.del(iKey);
        let newMapNode = iParent.add(iKey, new MapNode({}));
        newMapNode.setSrcByNode( newInput );
        newMapNode.setMapFuncByNode( mapBranch.getProp(mioMapIn) );
    }
}

function fillOtherLeaf(mapBranch, srcBranch)
{
    for( let n of srcBranch.iterTree() )
        if( n.isLeaf && ! (n instanceof InputNode) ) 
        {
            let newPath = toPath( n.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( i => i.key ) );
            let newCN = mapBranch.addNodeAtPath(newPath, new MapNode({}));
            newCN.setSrcByNode(n);
            newCN.setMapFuncByNode(mapBranch.getProp(mioMapOut));
        }
}

function fillAllLeaf(mapBranch, srcBranch)
{
    for( let n of srcBranch.iterTree() )
        if( n.isLeaf )
        {
            let newPath = toPath( n.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( i => i.key ) );
            let newCN = mapBranch.addNodeAtPath(newPath, new MapNode({}));
            newCN.setSrcByNode(n);
            newCN.setMapFuncByNode(mapBranch.getProp(mioMapOut));
        }
}
/////////////////////////////////////////////////////////

function getMapBiLink(srcBranch) {
    var f = mapBranch => buildMapBiLink(mapBranch, srcBranch);
    f[bexpand] = true;
    return f;
}
exports.getMapBiLink = getMapBiLink;

function buildMapBiLink(mapBranch, srcBranch) {
    buildMapBi({mapBranch, srcBranch, inputMode:'link'});
}

//

function getMapBiReplace(srcBranch) {
    var f = mapBranch => buildMapBiReplace(mapBranch, srcBranch);
    f[bexpand] = true;
    return f;
}
exports.getMapBiReplace = getMapBiReplace;

function buildMapBiReplace(mapBranch, srcBranch) {
    buildMapBi({mapBranch, srcBranch, inputMode:'replace'});
}
exports.buildMapBiReplace = buildMapBiReplace;

//

function buildMapBi({mapBranch, srcBranch, mapIn, mapOut, inputMode})
{
    if( mapIn===undefined )
        mapIn = function () { return x => x };
    if( mapOut===undefined )
        mapOut = function () { return x => x };

    if( srcBranch.isRoot ) {
        mapBranch.add(mioSrcBranch, srcBranch);
        mapBranch.getProp(mioSrcBranch).enumerable = false;
    }

    mapBranch.add(mioMapIn, new GetSetNode({
        getter: mapIn
    }));
    mapBranch.getProp(mioMapIn).enumerable = false;
    
    mapBranch.add(mioMapOut, new GetSetNode({
        getter: mapOut
    }));
    mapBranch.getProp(mioMapOut).enumerable = false;

    fillOtherLeaf(mapBranch, srcBranch);

    if( inputMode=='link' ) {
        mapBranch.add(mioInput, new ObjNode({}));
        mapBranch.getProp(mioInput).enumerable = false;
        fillInputLeaf(mapBranch, srcBranch);
    } else if( inputMode=='replace' ) {
        replaceInputLeaf(mapBranch, srcBranch);
    } else
        throw new Error(`invalid valid value ${inputMode} to doMapBranch`);
    
    for( let c of srcBranch.iterTree({includeNonEnumerable:true}) ) {
        // if branch & no children, then it didn't get added to mapBranch
        if( c.isBranch ) {
            let p = srcBranch.pathToNode(c);
            if( mapBranch.hasNodeAtPath(p) )
                mapBranch.nav(p).majors = c.majors;
            // if not, its because this branch was empty (or containing only branches)
            // in this case, majors are irrelevant.
        }
    }
}
exports.buildMapBi = buildMapBi;

/////////////////////////////////////////////////////////////

function getMapOut(srcBranch) {
    var f = mapBranch => buildMapOut(mapBranch, srcBranch);
    f[bexpand] = true;
    return f;
}
exports.getMapOut = getMapOut;

function buildMapOut(mapBranch, srcBranch)
{
    if( srcBranch.isRoot ) {
        mapBranch.add(mioSrcBranch, srcBranch);
        mapBranch.getProp(mioSrcBranch).enumerable = false;
    }

    mapBranch.add(mioMapOut, new GetSetNode({
        getter: function () { return x => x }
    }));
    mapBranch.getProp(mioMapOut).enumerable = false;

    fillAllLeaf(mapBranch, srcBranch);
}
exports.buildMapOut = buildMapOut;

/////////////////////////////////////////////////////////////

function getMapOutBCF(branchComputeFunc) {
    var f = mapBranch => buildMapOutBCF(mapBranch, branchComputeFunc)
    f[bexpand] = true;
    return f;
}
exports.getMapOutBCF = getMapOutBCF;

function buildMapOutBCF(mapBranch, branchComputeFunc)
{
    const {isDTProxy, dtProxyWrappedObject} = require('../consts');
    const {MapDef} = require('../node/sproxy');
    
    var mapFuncCN = new GetSetNode({});
    
    let bcfThis = new Proxy(mapBranch.parent, getDTProxyHandler({
        overNode: mapBranch.parent,
        rcvr: mapFuncCN,
        purpose: 'branch'
    }));
    
    let rv = branchComputeFunc.apply(bcfThis, []);

    if( rv===undefined )
        throw new Error(`branch compute func for ${mapBranch.fullName} returned undefined: ${branchComputeFunc.toString()}`);

    if( rv[isDTProxy] ) { // rv is a Proxy over a ObjNode or MapObjNode
        // identity function map
        var srcNode = rv[dtProxyWrappedObject];
        var mapFunc = x => x;
    } else if( rv instanceof MapDef ) {
        var srcNode = rv.node;
        var mapFunc = rv.mapFunc;
    }
    else
        throw new Error(`branch compute func for ${mapBranch.fullName} returned something that is not an ObjNode nor a MapDef`);

    ////////
    
    mapFuncCN.computeFunc = () => mapFunc;
    
    mapBranch.add(mioMapOut, mapFuncCN);
    mapBranch.getProp(mioMapOut).enumerable = false;
    
    fillAllLeaf(mapBranch, srcNode);
}
exports.buildMapOutBCF = buildMapOutBCF;

/////////////////////////////////////////////////////////////

exports.getAliasBranch = require('./alias').getAliasBranch;
exports.getMioMerge  = require('./merge').getMioMerge;

exports.merge2 = require('./merge2');
