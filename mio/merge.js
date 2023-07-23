
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

function fillOtherLeaf(dstBranch, srcBranch, mergeOpts)
{
    for( let n of srcBranch.iterTree() )
        if( n.isLeaf && ! (n instanceof InputNode) ) 
        {
            let newPath = toPath( n.nodesToAncestor(srcBranch).slice(0,-1).reverse().map( i => i.key ) );

            if( dstBranch.hasNodeAtPath(newPath) )
            {
                if( dstBranch.nav(newPath).isLeaf && mergeOpts.leafConflict == 'keepBase' ) 
                {
                    if( dstBranch.nav(newPath) instanceof InputNode ) 
                    {
                        // TODO: if dstBranch(newPath) is an input, delete it and replace with n
                        // n is always a non-input leaf
                        dstBranch.delp(newPath);
                    }
                    else
                        continue;
                } else
                    throw new Error(`merge conflict at ${newPath}`); // TODO
            }
            
            let newCN = dstBranch.addNodeAtPath(newPath, new MapNode({}));
            newCN.setSrcByNode(n);
            newCN.setMapFuncByNode(dstBranch.getProp(mioMapOut));
        }
}

function replaceInputLeaf(dstBranch, srcBranch, mergeOpts)
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
            if( dstBranch.nav(newPath).isLeaf && mergeOpts.leafConflict == 'keepBase' )
                var newInput = dstBranch.nav(newPath);
            else
                throw new Error(`merge conflict at ${newPath}`); // TODO
        }
        else 
            var newInput = dstBranch.addNodeAtPath(newPath, i.copyNode());
                
        iParent.del(iKey);
        let newMapNode = iParent.add(iKey, new MapNode({}));
        newMapNode.setSrcByNode( newInput );
        newMapNode.setMapFuncByNode( dstBranch.getProp(mioMapIn) );
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
            mioInputNode.setMapFuncByNode( dstBranch.getProp(mioMapIn) );
        }
        
        i.linkToNode( mioInputNode );
    }
}


function buildMioMerge(dstBranch, srcBranch, inputMode)
{
    // dstBranch should already have:
    //  mioSrcBranch         branch child
    //  mioMapIn, mioMapOut  leaf children

    var mergeOpts = dstBranch.mergeOpts;

    if( srcBranch.isRoot )
        dstBranch.getc(mioSrcBranch).merge( srcBranch );
    
    fillOtherLeaf(dstBranch, dstBranch.getc(mioSrcBranch), mergeOpts );
    
    if( inputMode=='link' ) {
        if( ! dstBranch.hasc(mioInput) ) {
            dstBranch.add(mioInput, new ObjNode({}));
            dstBranch.getProp(mioInput).enumerable = false;
        }
        fillInputLeaf(dstBranch, dstBranch.getc(mioSrcBranch) );
    } else if( inputMode=='replace' ) {
        //replaceInputLeaf(dstBranch, srcBranch, mergeOpts );
        replaceInputLeaf(dstBranch, dstBranch.getc(mioSrcBranch), mergeOpts);
    } else
        throw new Error(`invalid valid value for inputMode: ${inputMode}`);
}
exports.buildMioMerge = buildMioMerge;

function getMioMerge( srcBranch  )
{
    var f = dstBranch => buildMioMerge(dstBranch, srcBranch, 'link' );
    f[bexpand] = true;
    return f;
}
exports.getMioMerge = getMioMerge;

