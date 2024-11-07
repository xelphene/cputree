
'use strict';

class MapSpec {
    constructor ({mapNode, mapGetFunc, mapSetFunc, bindings}) {
        this.mapNode = mapNode;
        this.mapGetFunc = mapGetFunc;
        this.mapSetFunc = mapSetFunc;
        this.bindings = bindings;
    }

    matches (otherMapSpec) {
        const o = otherMapSpec;
        if( this.srcNode!==o.srcNode )
            return false;
        if( this.mapGetFunc!==o.mapGetFunc )
            return false;
        if( this.mapSetFunc!==o.mapSetFunc )
            return false;
        if( o.bindings.length != this.bindings.length )
            return false;
        for( let i=0; i<this.bindings.length; i++ )
            if( this.bindings[i] !== bindings[i] )
                return false;
        return true;

    }
}
exports.MapSpec = MapSpec;
