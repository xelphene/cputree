
// only use with:
// pwgobj4.mio.getYMirrorBiReplace2
// gobj4.mio.getMapBiReplace

'use strict';

const {
    mioSrcBranch, mioMapIn, mioMapOut, mioInput,
    parent, bexpand,
} = require('../consts');

const {ObjNode, ComputeNode, InputNode, MapNode} = require('../ctl');

const {toPath} = require('../path');
const conProxyUnwrap = require('../tmpl/unwrap').conProxyUnwrap;

function fillOtherLeaf(dstBranch, srcBranch)
{
    for( let n of srcBranch.iterTree() )
    {
        if( n.isLeaf && ! (n instanceof InputNode) ) 
        {
            let newPath = toPath( n.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( i => i.key ) );

            if( dstBranch.hasNodeAtPath(newPath) )
            {
                if( dstBranch.nav(newPath).isLeaf ) 
                {
                    if( dstBranch.nav(newPath) instanceof InputNode ) 
                    {
                        dstBranch.delp(newPath);
                    }
                    else
                        continue;
                } else
                    throw new Error(`merge conflict at ${newPath}`);
            }
            
            let newCN = dstBranch.addNodeAtPath(newPath, new MapNode({}));
            newCN.setSrcByNode(n);
            newCN.setMapFuncByNode(dstBranch.parent.getProp(mioMapOut));
        }
    }
}

function replaceInputLeaf(dstBranch, srcBranch)
{
    for( let i of srcBranch.iterTreeInputUnlinked() )
    {
        let iParent = i.parent;
        let iKey = i.key;
        //let newPath = i.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( z => z.key );
        let newPath = toPath( i.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( z => z.key ) );

        if( dstBranch.hasNodeAtPath(newPath) )
        {
            // dstBranch also has an input here. just link to it.
            if( dstBranch.nav(newPath).isLeaf )
                var newInput = dstBranch.nav(newPath);
            else
                throw new Error(`merge conflict at ${newPath}`); // TODO
        }
        else 
            var newInput = dstBranch.addNodeAtPath(newPath, i.copyNode());
                
        iParent.del(iKey);
        let newMapNode = iParent.add(iKey, new MapNode({}));
        newMapNode.setSrcByNode( newInput );
        newMapNode.setMapFuncByNode( dstBranch.parent.getProp(mioMapIn) );
    }
}

function fillInputLeaf(dstBranch, srcBranch)
{
    for( let i of srcBranch.iterTreeInput() )
    {
        //console.log(`found input ${i.fullName} depth ${i.depth}`);
        //console.log(i.keyPath);
        
        let iParent = i.parent;
        let iKey = i.key;
        
        let dstBranchInputPath = toPath( i.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( z => z.key ) );

        let dstBranchInputNode;
        if( dstBranch.hasp(dstBranchInputPath) )
            dstBranchInputNode = dstBranch.nav(dstBranchInputPath);
        else
            dstBranchInputNode = dstBranch.addNodeAtPath(dstBranchInputPath, i.copyNode());

        //

        let mioInputPath = toPath(i.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( z => z.key ))
            .prepend(mioInput);
        
        let mioInputNode;
        if( dstBranch.hasp(mioInputPath) )
            mioInputNode = dstBranch.nav(mioInputPath);
        else {
            mioInputNode = dstBranch.addNodeAtPath(mioInputPath, new MapNode({}));
            mioInputNode.setSrcByNode( dstBranchInputNode );
            mioInputNode.setMapFuncByNode( dstBranch.parent.getProp(mioMapIn) );
        }
        
        i.linkToNode( mioInputNode );
    }
}

// TODO: move to consts if we go this way
const mioMeta = Symbol('mioMeta');
const mioNegate = Symbol('mioNegate');

/*
TODO: check to see if src/in/out syms exist in dstBranch[parent].
if not, create them.B
*/
function buildMioMerge2(dstBranch, srcBranch, inputMode)
{
    dstBranch = conProxyUnwrap(dstBranch);
    
    // TODO: make an actual property on ObjNode, I guess
    if( ! Object.hasOwnProperty(dstBranch, mioMeta) )
        dstBranch[mioMeta] = {};
    
    if( ! dstBranch[mioMeta].hasOwnProperty(mioNegate) );
    {
        var srcSym = Symbol( dstBranch.key.toString()+'_mioSrc');
        var inSym  = Symbol( dstBranch.key.toString()+'_mioMapIn');
        var outSym = Symbol( dstBranch.key.toString()+'_mioMapOut');
        
        dstBranch[mioMeta][mioNegate] = { srcSym, inSym, outSym };
    }
    

    // dstBranch should already have:
    //  mioSrcBranch         branch child
    //  mioMapIn, mioMapOut  leaf children

    if( srcBranch.isRoot )
        dstBranch.parent.getc(mioSrcBranch).merge( srcBranch );
    
    fillOtherLeaf(dstBranch, dstBranch.parent.getc(mioSrcBranch) );
    
    if( inputMode=='link' ) {
        if( ! dstBranch.hasc(mioInput) ) {
            dstBranch.parent.add(mioInput, new ObjNode({}));
            dstBranch.parent.getProp(mioInput).enumerable = false;
        }
        fillInputLeaf(dstBranch, dstBranch.parent.getc(mioSrcBranch) );
    } else if( inputMode=='replace' ) {
        replaceInputLeaf(dstBranch, dstBranch.parent.getc(mioSrcBranch) );
    } else
        throw new Error(`invalid valid value for inputMode: ${inputMode}`);
}
exports.buildMioMerge2 = buildMioMerge2;

function getMioMerge2( srcBranch  )
{
    var f = dstBranch => buildMioMerge2(dstBranch, srcBranch, 'link' );
    f[bexpand] = true;
    return f;
}
exports.getMioMerge2 = getMioMerge2;

function initDst(dstBranch)
{
    dstBranch = conProxyUnwrap(dstBranch);
    
    var srcSym = Symbol( dstBranch.key.toString()+'_mioSrc');
    var inSym  = Symbol( dstBranch.key.toString()+'_mioMapIn');
    var outSym = Symbol( dstBranch.key.toString()+'_mioMapOut');
    
    dstBranch.parent.addBranch(srcSym);

    // TODO
    dstBranch.parent.addCompute(inSym,  function () { return n => -n; } );
    dstBranch.parent.addCompute(outSym, function () { return n => -n; } );
}
exports.initDst = initDst;
