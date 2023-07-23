
'use strict';

const {ObjNode, ComputeNode, InputNode} = require('./ctl');
const {
    getn,
    mioOrig, mioMapIn, mioMapOut
} = require('./consts');

function addInput(root)
{
    for( let i of root.getProp(mioOrig).iterTreeInput() )
    {
        //console.log(`found input ${i.fullName} depth ${i.depth}`);
        //console.log(i.keyPath);
        
        let iParent = i.parent;
        let iKey = i.key;
        let iKeyPath = i.keyPath;
        let iValidate = i.validate;
        
        let newInput = root.addDeep(iKeyPath.slice(1), new InputNode({
            validate: iValidate
        }));
        
        iParent.del(iKey);
        iParent.add(iKey, new ComputeNode({
            computeFunc: function () {
                //console.log(`HERE key=${key}`);
                let n1 = this[getn](root); // FAIL
                return this[getn](root)[mioMapIn]( // map func at root of miomap tree
                    this[getn](newInput) // value on the NEW input node
                );
            }
        }));
        
    }
}

function addOtherLeaf(root)
{
    for( let n of root.getProp(mioOrig).iterTree() )
        if( n.isLeaf && ! (n instanceof InputNode) ) 
        {
            let newPath = n.keyPath.slice(1);
            root.addDeep(newPath, new ComputeNode({
                computeFunc: function () {
                    return this[getn](root)[mioMapOut](
                        this[getn](n)
                    );
                }
            }));
        }
}

function buildMioTree({orig, mapIn, mapOut, ObjNodeConstructor})
{
    if( ! orig.isRoot )
        throw new Error('orig must not already be in the tree. that is not yet supported');
    
    if( ObjNodeConstructor!==undefined )
        var root = new ObjNodeConstructor({});
    else
        var root = new ObjNode({});
    
    root.add(mioOrig, orig); // !!!
    root.getProp(mioOrig).enumerable = false;
    root.add(mioMapIn, new ComputeNode({
        computeFunc: mapIn
    }));
    root.getProp(mioMapIn).enumerable = false;
    root.add(mioMapOut, new ComputeNode({
        computeFunc: mapOut
    }));
    root.getProp(mioMapOut).enumerable = false;

    addOtherLeaf(root);

    addInput(root);
    
    return root;
}
exports.buildMioTree = buildMioTree;
