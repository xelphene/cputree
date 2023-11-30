
'use strict';

const {C, N, O, ObjNode, InputNode, inpn, excOriginNode} = require('../index');

var root = new ObjNode({});
var P = root[C];

P.x.y = inpn.number();
P.x.f = function () {
    return this.y + 2;
}
P.x.fail = function () {
    return this.nestedFail + 100;
}
P.x.nestedFail = function () {
    //console.log( this[N].nav('asdf') );
    //return 9;
    throw new Error('blah');
}

//root.init({});
//root.init({x:{y:222}});

try {
    root.init({x:{y:222}});
} catch(e) {
    console.log('================================');
    console.log('');
    console.log(''+e);
    //console.log( Object.getOwnPropertyNames(e) );
    console.log( Object.keys({...e}).length );
    
    console.log( e[excOriginNode] );
}


//root.logFlat();
