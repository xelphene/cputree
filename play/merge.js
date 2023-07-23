
'use strict';

const {
    ObjNode,InputNode, parent,
    ComputeNode, mioMapOut, mioSrcBranch
} = require('../');


function mergeLeaf(baseT, incT, key)
{
    let bc = baseT.getc(key);
    let ic = incT.getc(key);

    if( bc instanceof InputNode && ic instanceof InputNode )
    {
        //console.log(`${ic.fullName}: ok. both inputs. keep bc`);
    }
    else if( bc instanceof InputNode && ! (ic instanceof InputNode) ) 
    {
        //console.log(`${ic.fullName}: ok. bc input, ic not. replace bc with ic`);
        // discard baseT's version of the child
        baseT.detachChild(key);
        // keep incT's version of the child
        ic.detachParent();
        baseT.addc(key, ic);
    }
    else if( ! (bc instanceof InputNode) && ic instanceof InputNode )
    {
        //console.log(`${ic.fullName}: ok. bc non-input, ic input. ignore ic.`);
    }
    else 
    {
        //console.log(`${ic.fullName}: FAIL. both are non-input leafs.`);
        throw new Error(`tree merge failed at ${ic.fullName}: both nodes are non-input leaf nodes`);
    }
}

function tMerge(baseT, incT)
{
    var iCs = [];
    for( let ic of incT.iterChildren() )
        iCs.push([ic, ic.key]);

    for( let [ic, icKey] of iCs )
    {
        if( ! baseT.hasc(icKey) ) 
        {
            console.log(`${ic.fullName}: ok: no baseC. copy ic into baseT`);
            let key = ic.key;
            ic.detachParent();
            baseT.addc(key, ic);
        }
        else
        {
            let bc = baseT.getc(icKey);
            if( bc.isBranch && ic.isBranch ) 
            {
                console.log(`${ic.fullName}: ok: both branches. recurse.`);
                for( let sk of ic.getSliderKeys() )
                    bc.addSliderKey(sk);
                bc.majors = bc.majors.concat(ic.majors);
                tMerge(bc, ic);
            }
            else if( bc.isBranch && ic.isLeaf ) 
            {
                //console.log(`${ic.fullName}: FAIL: bc branch, ic leaf.`);
                throw new Error(`tree merge failed at ${ic.fullName}: base node is a branch but incoming is a leaf.`);
            } 
            else if( bc.isLeaf && ic.isBranch ) 
            {
                //console.log(`${ic.fullName}: FAIL: bc leaf, ic branch.`);
                throw new Error(`tree merge failed at ${ic.fullName}: base node is a branch but incoming is a leaf.`);
            }
            else
                mergeLeaf(baseT, incT, icKey);
        }
    }
}
exports.tMerge = tMerge;
