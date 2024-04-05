
'use strict';

const {Node, TGetNode} = require('../node');
const {TreeFiller} = require('./fill');
const {unwrap} = require('./util');

class PredicateFuncBuilder extends TreeFiller {
    constructor({predicate, funcs}) {
        super();
        
        predicate = unwrap(predicate);
        if( predicate instanceof Node )
            this._predicateNode = predicate;
        else if( ['boolean','string','number'].includes(typeof(predicate)) )
            this._predicateNode = new TGetNode({
                bindings: [],
                getFunc:  () => predicate
            })
        else {
            throw new Error('unknown value for predicate argument');
        }
        
        this._funcs = funcs;
    }
    
    fill(dstParent, dstKey, buildProxyBindings) {
        const funcs = this._funcs;
        dstParent.addc(dstKey, new TGetNode({
            bindings: [this._predicateNode].concat(buildProxyBindings),
            getFunc:  function () {
                let pred = arguments[0];
                if( pred in funcs )
                    return funcs[pred].apply(null, [...arguments].slice(1));
                else
                    throw new Error(`unknown predicate ${pred}`);
            }
        }));
    }
}
function predFunc(predicate, funcs) {
    return new PredicateFuncBuilder({predicate, funcs});
}
exports.predFunc = predFunc;
