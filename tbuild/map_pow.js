
'use strict';

const {LeafNode} = require('../node');
const {MapFuncBuilder} = require('./map');
const {unwrap} = require('./util');

class PowMapNodeBuilder extends MapFuncBuilder
{
    constructor(src, pow) {
        super({src, mapGetFunc:null, mapSetFunc:null });
        this.pow = unwrap(pow);
    }
    
    get mapFuncBindings () { return [this.pow] }
    get mapGetFunc      () { return (p,v) => v * 10**p }
    get mapSetFunc      () { return (p,v) => v / 10**p }
    
}

class PowMapFuncBuilder extends MapFuncBuilder
{
    constructor(src, pow) {
        super({src, mapGetFunc:null, mapSetFunc:null });
        this.pow = unwrap(pow);
        if( typeof(this.pow) != 'function' )
            throw new TypeError('function required for pow argument');
    }
    
    get mapFuncBindings () { return this.buildProxyBindings }
    get mapGetFunc      () {
        const pow = this.pow;
        return function () {
            let v = [...arguments].slice(-1);
            let p = pow.apply(null, [...arguments].slice(0,-1));
            return v * 10**p;
        }
    }
    get mapSetFunc      () {
        const pow = this.pow;
        return function () {
            let v = [...arguments].slice(-1);
            let p = pow.apply(null, [...arguments].slice(0,-1));
            return v / 10**p;
        }
    }
    
}

exports.powMap = function(src, pow) {
    if( pow instanceof LeafNode )
        return new PowMapNodeBuilder(src, pow);
    else if( typeof(pow)=='function')
        return new PowMapFuncBuilder(src, pow);
    else
        throw new Error('unknown value for pow');
}
