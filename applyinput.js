
'use strict';

const {
    CTL
} = require('./consts');
const ObjNode = require('./node/index').ObjNode;

function applyInput(root, input, path)
{
    if( ! ( root[CTL] instanceof ObjNode ) )
        //throw new Error(`node at ${root[CTL].fullName} is not an ObjNode`);
        throw new Error(`root[CTL] is not an ObjNode`);
    
    if( path===undefined ) path = [];
    
    var fails = {};
    for( let k of Object.keys(input) ) {
        if( root[CTL].haveInputWithName(k) ) {
            root[k] = input[k];
        } else if( root[CTL].haveObjWithName(k) ) {
        
            let nfs = applyInput(root[k], input[k], path.concat(k));
            
            if( Object.keys(nfs).length > 0 ) {
                fails[k] = {};
                for( let k2 of Object.keys(nfs) ) {
                    fails[k][k2] = nfs[k2];
                }
            }
        } else {
            fails[k] = new NoSuchNode(path.concat(k));
        }
    }
    
    //return fails;

    if( path.length==0 ) {
        // root
        let air = new ApplyInputResult(fails);
        //for( let r of air.iter() )
        //    console.warn(r.toString());
        
        return air;
    } else {
        return fails;
    }
}
exports.applyInput = applyInput;

class ApplyInputResult {
    constructor(failTree) {
        this._tree = failTree;
    }
    
    get tree () { return this._tree }
    
    * iter () {
        for( let f of iterFailures(this._tree) ) {
            yield f;
        }
    }
    
    get failure () {
        return Object.keys(this._tree).length > 0;
    }
}
exports.ApplyInputResult = ApplyInputResult;


class ApplyInputFailure {
    constructor(path) {
        this._path = path;
    }
    
    get path () { return this._path }
    
    get pathStr () { return this._path.join('.') }
}

class NoSuchNode extends ApplyInputFailure {
    get reason () {
        return 'No corresponding input node was found in the tree';
    }

    toString () {
        return `${this.pathStr}: ${this.reason}`;
    }
}

function * iterFailures(failures, path) {
    if( path===undefined ) path = [];
    
    for( let k of Object.keys(failures) ) {
        if( failures[k] instanceof ApplyInputFailure ) {
            yield failures[k]
        } else {
            for( let f of iterFailures(failures[k], path.concat(k)) ) {
                yield f
            }
        }
    }
}
