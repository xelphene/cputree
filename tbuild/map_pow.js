
'use strict';

const {TNode} = require('../node/tnode');
const {MapFuncBuilder} = require('./map');
const {unwrap} = require('./util');

class PowMapBuilder extends MapFuncBuilder
{
    constructor(src, pow) {
        super(src, null);
        this.pow = unwrap(pow);
    }
    
    get mapFuncAndBindings ()
    {
        if( this.pow instanceof TNode ) {
            return [
                [this.pow], (p,v) => v * 10**p
            ];
        } else if( typeof(this.pow)=='function' ) {
            let pow = this.pow;
            let mapFunc = function () {
                let v = [...arguments].slice(-1);
                let p = pow.apply(null, [...arguments].slice(0,-1));
                return v * 10**p;
            }
            return [this.buildProxyBindings, mapFunc];
        } else {
            console.log(this.pow);
            throw new Error('unknown value for pow');
        }
    }
    
    get mapFuncBindings () { return this.mapFuncAndBindings[0] }
    get mapFunc         () { return this.mapFuncAndBindings[1] }
    
}
exports.PowMapBuilder = PowMapBuilder;

exports.powMap = function(src, pow) {
    return new PowMapBuilder(src, pow);
}
