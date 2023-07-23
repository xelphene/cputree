
'use strict';

const og = require('octogeom');
const {sub, CTL, InputDef, constructorize} = require('gobj2');

function mixInMixIn(dst, src, path)
{
    if( path===undefined ) path = ['root'];
    var pathStr = path.join('.');
    
    for( let k in src ) {
        if( typeof(src[k]) == 'object' && (! (src[k] instanceof InputDef)) ) {
            if( ! k in dst ) dst[k]={} ;
            if( typeof(dst[k]) != 'object' ) throw new Error(`type conflict at ${pathStr}.${k}`);
            
            mixInMixIn(dst[k], src[k], path.concat([k]) );
            dst[k][sub] = true;
        } else {
            dst[k] = src[k];
        }
    }
    return dst;
}

function main2 () {
    var base = require('./base');
    var neck = require('./neck');
    var t = mixInMixIn(base, neck);
    console.log(t);
    
    var T = constructorize(t);
    var root = new T();
    
    root.input.neckHoleRadius = 3.5;
    
    root[CTL].computeIfNeeded();

    console.log('^^^^^^^^^');
    console.log(root.front.neck.$);
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
