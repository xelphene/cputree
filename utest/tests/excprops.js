
'use strict';

const {C, N, O, ObjNode, InputNode, inpn, excOriginNode} = require('../../');

function getTreeNestedFail() {
    var root = new ObjNode({});
    var P = root[C];

    P.x.fail = function () {
        return this.nestedFail + 100;
    }
    P.x.nestedFail = function () {
        throw new Error('blah');
    }

    var exc=null;
    try {
        root.init({});
    } catch(e) {
        exc=e;
    }
    
    return {root, exc};
}

function getTreeInputValFail() {
    var root = new ObjNode({});
    var P = root[C];

    P.x.y = inpn.number();
    P.x.f = function () {
        return this.y + 2;
    }

    var exc=null;
    try {
        root.init({});
    } catch(e) {
        exc=e;
    }
    
    return {root, exc};
}

function navError() {
    var root = new ObjNode({});

    var exc=null;
    try {
        root.init({});
        root.nav('x.y.z');
    } catch(e) {
        exc=e;
    }
    
    return {root, exc};
}

function testNested(t) {
    var tf = getTreeNestedFail;
    var {root, exc} = tf();
    
    t.callIsNot( () => exc, null );
    
    t.callIs( () => exc[excOriginNode], root.nav('x.nestedFail') );
}

function testInput(t) {
    var tf = getTreeInputValFail;
    var {root, exc} = tf();
    
    t.callIsNot( () => exc, null );
    
    // enumerable, own, string & symbol
    t.callEq( () => Object.keys({...exc}).length, 0 );    
}

function testNavError(t) {
    var tf = navError;
    var {root, exc} = tf();
    
    t.callIsNot( () => exc, null );
    
    // enumerable, own, string & symbol
    t.callEq( () => Object.keys({...exc}).length, 0 );        
}

function test(t) {
    testNested(t);
    testInput(t);
    testNavError(t);
}

function main () {
    const Tester = require('../tester').Tester;
    var t = new Tester();

    test(t);

    console.log('');
    console.log('='.repeat(40));
    console.log('test results:');
    t.logResults();
}

if( require.main === module ) {
    main();
}
