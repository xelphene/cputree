
// only use with:
// pwgobj4.mio.getYMirrorBiReplace2
// gobj4.mio.getMapBiReplace

'use strict';

const {
    mioSrcBranch, mioMapIn, mioMapOut, mioInput,
    parent, bexpand,
} = require('../consts');

const {ObjNode, ComputeNode, InputNode, MapNode} = require('../node');

const {toPath} = require('../path');
const conProxyUnwrap = require('../tmpl/unwrap').conProxyUnwrap;

function fillOtherLeaf(dstBranch, srcBranch, brSym)
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
            newCN.setMapFuncByNode(dstBranch.parent.getc(brSym).getc(mioMapOut));
        }
    }
}

function replaceInputLeaf(dstBranch, srcBranch, brSym)
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
        newMapNode.setMapFuncByNode( dstBranch.parent.getc(brSym).getc(mioMapIn) );
    }
}

function fillInputLeaf(dstBranch, srcBranch, brSym)
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

        //let mioInputPath = toPath(i.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( z => z.key ))
        //    .prepend(mioInput);
        let mioInputPath = toPath(i.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( z => z.key ))
            .prepend(mioInput)
            .prepend(brSym)
            .prepend(parent)
        
        let mioInputNode;
        if( dstBranch.hasp(mioInputPath) )
            mioInputNode = dstBranch.nav(mioInputPath);
        else {
            mioInputNode = dstBranch.addNodeAtPath(mioInputPath, new MapNode({}));
            mioInputNode.setSrcByNode( dstBranchInputNode );
            mioInputNode.setMapFuncByNode( dstBranch.parent.getc(brSym).getc(mioMapIn) );
        }
        
        i.linkToNode( mioInputNode );
    }
}

// TODO: move to consts if we go this way
const mioMeta = Symbol('mioMeta');
const mioNegate = Symbol('mioNegate');

function buildMioMerge2({dstBranch, srcBranch, inputMode, mapComputeIn, mapComputeOut})
{
    dstBranch = conProxyUnwrap(dstBranch);
    
    // TODO: make an actual property on ObjNode, I guess
    if( ! dstBranch.hasOwnProperty(mioMeta) ) {
        dstBranch[mioMeta] = {};
    }
    
    if( ! dstBranch[mioMeta].hasOwnProperty(mioNegate) )
    {
        var brSym  = Symbol( dstBranch.key.toString()+'_mio');
        dstBranch[mioMeta][mioNegate] = { brSym };
    } else {
        var brSym  = dstBranch[mioMeta][mioNegate].brSym;
    }
    
    if( ! dstBranch.parent.hasc(brSym) ) {
        dstBranch.parent.addBranch(brSym);
        dstBranch.parent.getc(brSym).addBranch(mioSrcBranch);
        dstBranch.parent.getc(brSym).enumerable = false;
        dstBranch.parent.getc(brSym).addCompute(mioMapIn,  mapComputeIn);
        dstBranch.parent.getc(brSym).addCompute(mioMapOut, mapComputeOut);
    }
    
    // dstBranch should already have:
    //  mioSrcBranch         branch child
    //  mioMapIn, mioMapOut  leaf children

    if( srcBranch.isRoot )
        dstBranch.parent.getc(brSym).getc(mioSrcBranch).merge( srcBranch );
    
    fillOtherLeaf(dstBranch, dstBranch.parent.getc(brSym).getc(mioSrcBranch), brSym );
    
    if( inputMode=='link' ) {
        //if( ! dstBranch.getc(brSym).hasc(mioInput) ) {
        //    dstBranch.parent.getc(brSym).addBranch(mioInput);
        //    dstBranch.parent.getProp(mioInput).enumerable = false;
        //}
        fillInputLeaf(dstBranch, dstBranch.parent.getc(brSym).getc(mioSrcBranch), brSym );
    } else if( inputMode=='replace' ) {
        replaceInputLeaf(dstBranch, dstBranch.parent.getc(brSym).getc(mioSrcBranch), brSym );
    } else
        throw new Error(`invalid valid value for inputMode: ${inputMode}`);
}
exports.buildMioMerge2 = buildMioMerge2;

function getMioNegate( srcBranch )
{
    var f = dstBranch => buildMioMerge2({
        dstBranch, srcBranch,
        inputMode:'link',
        mapComputeIn:  function () { return n => -n; },
        mapComputeOut: function () { return n => -n; },
    });
    f[bexpand] = true;
    return f;    
}
exports.getMioNegate = getMioNegate;

function getMioMerge2( srcBranch, mapComputeIn, mapComputeOut )
{
    var f = dstBranch => buildMioMerge2({
        dstBranch, srcBranch,
        inputMode: 'link',
        mapComputeIn, mapComputeOut
    });
    f[bexpand] = true;
    return f;
}
exports.getMioMerge2 = getMioMerge2;

