
'use strict';

const og = require('octogeom');
const {
    sub, CTL, InputDef, constructorize, parent,
    isComputeProxy,  computeProxyWrappedObject
} = require('gobj2');

function main2 () {
    var O = {
        v: function () { return 42 },
        i: {
            $: function () { return this[parent] },
            p: function () { return this.$.v+1 },
            [sub]: true
        },
        getI: function () { return this.i },
    };
    var OC = constructorize(O);
    var root = new OC();
    
    root[CTL].computeIfNeeded();

    console.log('^^^^^^^^^');
    //console.log(root.i.$);
    //console.log(root.i.$[isComputeProxy]);
    //console.log(root.i.$);
    //console.log(root[CTL].simpleObject);
    console.log(root.getI.p);
    console.log('^^^^^^^^^');
    return;
    
    root[CTL].logStruct();

    
    console.log('');
    console.log('='.repeat(40));
    console.log('');
    
    console.log(root);
}

function main () {
    var base = require('./base');
    var neck = require('./neck');


    var t = mixInMixIn(base, neck);

    console.log(t);
}

main2();
