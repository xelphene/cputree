
'use strict';

const {ObjNode, ComputeNode, InputNode} = require('./ctl');
const {
    get,
    mioOrig, mioMapIn, mioMapOut
} = require('./consts');

function addInput(root, orig)
{
    for( let i of orig.iterTreeInput() )
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
                return this[get](root)[mioMapIn]( // map func at root of miomap tree
                    this[get](newInput) // value on the NEW input node
                );
            }
        }));
        
        console.log('');
    }
}

function addOtherLeaf(root, orig)
{
    for( let n of orig.iterTree() )
        if( n.isLeaf && ! (n instanceof InputNode) ) 
        {
            let newPath = n.keyPath.slice(1);
            root.addDeep(newPath, new ComputeNode({
                computeFunc: function () {
                    return this[get](root)[mioMapOut](
                        this[get](n)
                    );
                }
            }));
        }
}

function buildTree({orig, addOrigAsChild, mapIn, mapOut})
{
    var root = new ObjNode({});
    if( addOrigAsChild )
        root.add(mioOrig, orig);
    root.add(mioMapIn, new ComputeNode({
        computeFunc: mapIn
    }));
    root.add(mioMapOut, new ComputeNode({
        computeFunc: mapOut
    }));


    addOtherLeaf(root, orig);

    addInput(root, orig);
    
    return root;
}
exports.buildTree = buildTree;
