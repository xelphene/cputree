
'use strict';

const {ObjNode, ComputeNode, InputNode} = require('./ctl');
const {
    getn, CTL,
    mioOrig, mioMapIn, mioMapOut
} = require('./consts');

function addInput(root, orig)
{
    //for( let i of root.getProp(mioOrig).iterTreeInput() )
    for( let i of orig.iterTreeInput() )
    {
        //console.log(`found input ${i.fullName} depth ${i.depth}`);
        //console.log(i.keyPath);
        
        let iParent = i.parent;
        let iKey = i.key;
        let newPath = i.nodesToAncestor(orig).slice(0,-1).reverse().map( z => z.key );

        let newInput = root.addDeep(newPath, i.copyDef());
        
        iParent.del(iKey);
        iParent.add(iKey, new ComputeNode({
            computeFunc: function () {
                let n1 = this[getn](root);
                return this[getn](root)[mioMapIn]( // map func at root of miomap tree
                    this[getn](newInput) // value on the NEW input node
                );
            }
        }));
        
    }
}

function addOtherLeaf(root, orig)
{
    //for( let n of root.getProp(mioOrig).iterTree() )
    for( let n of orig.iterTree() )
        if( n.isLeaf && ! (n instanceof InputNode) ) 
        {
            //let newPath = n.nodesToAncestor(orig).slice(0,-1).map( i => i.key );
            let newPath = n.nodesToAncestor(orig).slice(0,-1).reverse().map( i => i.key );
            let newPathStr = newPath.map( i => i.toString() );
            root.addDeep(newPath, new ComputeNode({
                computeFunc: function () {
                    let n1 = this[getn](root);
                    //console.log(n1);
                    return this[getn](root)[mioMapOut](
                        this[getn](n)
                    );
                }
            }));
        }
}

function buildMioTree({orig, mapIn, mapOut, ObjNodeConstructor})
{
    if( ObjNodeConstructor!==undefined )
        var root = new ObjNodeConstructor({});
    else
        var root = new ObjNode({});

    if( mapIn===undefined )
        mapIn = function () { return x => x };
    if( mapOut===undefined )
        mapOut = function () { return x => x };

    if( orig.isRoot ) {
        root.add(mioOrig, orig);
        root.getProp(mioOrig).enumerable = false;
    }

    root.add(mioMapIn, new ComputeNode({
        computeFunc: mapIn
    }));
    root.getProp(mioMapIn).enumerable = false;
    
    root.add(mioMapOut, new ComputeNode({
        computeFunc: mapOut
    }));
    root.getProp(mioMapOut).enumerable = false;

    addOtherLeaf(root, orig);

    addInput(root, orig);
    
    return root;
}
exports.buildMioTree = buildMioTree;
