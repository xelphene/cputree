
'use strict';

const {ObjNode, ComputeNode, InputNode,} = require('./ctl');
const {
    getn, getp, CTL,
    mioOrig, mioMapIn, mioMapOut,
    parent
} = require('./consts');
const {getDTProxyHandler} = require('./ctl/sproxy');
const {toPath} = require('./path');

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
        let pathToNewInput = iParent.pathToNode(newInput);
        let pathToRoot = iParent.pathToNode(root);

        //console.log(`${i.fullName}  ::  ${pathToNewInput.toString()}`);
        
        iParent.del(iKey);
        iParent.add(iKey, new ComputeNode({
            computeFunc: function () {
                
                return this[getp](pathToRoot)[mioMapIn](
                    this[getp](pathToNewInput)
                );
                
                /*
                return this[getn](root)[mioMapIn]( // map func at root of miomap tree
                    this[getn](newInput) // value on the NEW input node
                );
                */
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

            let pathToRoot = toPath( Array(newPath.length-1).fill(parent) );
            let pathToOrigNode = pathToRoot.append(mioOrig).concat(
                toPath(newPath)
            );
            
            root.addDeep(newPath, new ComputeNode({
                computeFunc: function () {
                    return this[getp](pathToRoot)[mioMapOut](
                        this[getp](pathToOrigNode)
                    );
                    /*
                    return this[getn](root)[mioMapOut](
                        this[getn](n)
                    );
                    */
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

/////////////////////////////////////////////////////////

function fillLeaf(root, orig)
{
    //for( let n of root.getProp(mioOrig).iterTree() )
    for( let n of orig.iterTree() )
        //if( n.isLeaf && ! (n instanceof InputNode) ) 
        if( n.isLeaf )
        {
            //let newPath = n.nodesToAncestor(orig).slice(0,-1).map( i => i.key );
            let newPath = n.nodesToAncestor(orig).slice(0,-1).reverse().map( i => i.key );
            let newPathStr = newPath.map( i => i.toString() );

            let pathToRoot = toPath( Array(newPath.length-1).fill(parent) );
            //let pathToOrigNode = pathToRoot.append(mioOrig).concat(
            //    toPath(newPath)
            //);
            
            let newCN = root.addDeep(newPath, new ComputeNode({}));
            //console.log(`newCN: ${newCN.fullName}`);
            //console.log(`pathToRoot: ${pathToRoot}`);
            let pathToOrigNode = newCN.parent.pathToNode(n);
            //console.log(`pathToOrigNode: ${pathToOrigNode}`);
            newCN.computeFunc = function () {
                return this[getp](pathToRoot)[mioMapOut](
                    this[getp](pathToOrigNode)
                );
            };
        }
}


function mapBranch({orig, mapIn, mapOut}) {
    return mapRoot => doMapBranch({mapRoot, orig, mapIn, mapOut});
}
exports.mapBranch = mapBranch;

function doMapBranch({mapRoot, orig, mapIn, mapOut})
{
    if( mapIn===undefined )
        mapIn = function () { return x => x };
    if( mapOut===undefined )
        mapOut = function () { return x => x };

    if( orig.isRoot ) {
        mapRoot.add(mioOrig, orig);
        mapRoot.getProp(mioOrig).enumerable = false;
    }

    mapRoot.add(mioMapIn, new ComputeNode({
        computeFunc: mapIn
    }));
    mapRoot.getProp(mioMapIn).enumerable = false;
    
    mapRoot.add(mioMapOut, new ComputeNode({
        computeFunc: mapOut
    }));
    mapRoot.getProp(mioMapOut).enumerable = false;

    fillLeaf(mapRoot, orig);
}

/////////////////////////////////////////////////////////

function mioBmap(branchComputeFunc) {
    return mapRoot => doMioBmap({mapRoot, branchComputeFunc})
}
exports.mioBmap = mioBmap;

function doMioBmap({mapRoot, branchComputeFunc})
{
    var mapFuncCN = new ComputeNode({});
    
    let bcfThis = new Proxy(mapRoot.parent, getDTProxyHandler({
        overNode: mapRoot.parent,
        rcvr: mapFuncCN,
        purpose: 'branch'
    }));
    
    let mapDef = branchComputeFunc.apply(bcfThis, []);
    
    mapFuncCN.computeFunc = () => mapDef.mapFunc;
    var mapSrcNode = mapDef.node;
    
    mapRoot.add(mioMapOut, mapFuncCN);
    mapRoot.getProp(mioMapOut).enumerable = false;
    
    fillLeaf(mapRoot, mapSrcNode);
    
    return 
}

