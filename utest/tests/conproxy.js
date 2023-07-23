
'use strict';

const {
    ObjNode, MapObjNode, ComputeNode, InputNode,
    parent, bmap, bfunc, enumerable, bexist, inpn,
    conProxyUnwrap, C, N, O
} = require('../../');

function test(t)
{
    var root = new ObjNode({});
    var p = root.getConProxy();
    
    p.cn0 = function () { return 222 };
    p.inpA = inpn.any();
    p.inp0 = inpn.number();
    // ... later: make it into a refCN:
    p.inp0 = function () { return this.cn0 };
    p.inp1 = inpn.number();
    
    p.dx = inpn.number();
    p.cn = function () { return 22 }
    
    p.sub = {};
    p.sub.scn = function () { return this[parent].inp1*10 + this[parent].cn };
    p.sub.inpRepInp0 = inpn.number();
    p.sub.inpRepInp0 = p.inp0;
    p.sub.inpRepInpA = inpn.any();
    p.sub.inpRepInpA = p.inpA;
    p.sub.inpRepInpDx = inpn.number();
    p.sub.inpRepInpDx = p.dx;

    p.sne = {};
    p.sne[enumerable] = false;

    p.sbe = bexist;
    p.sbe.ssbe = bexist;
    p.sbe.c = function () { return 831 };
    p.sbe.ssbe.c = function () { return 38 };

    p.smap = function () {
        return this.sub;
    }
    p.smap[bfunc] = true;

    p.smap2 = function () {
        return this.sub[bmap](
            v => v+this.dx
        );
    }
    p.smap2[bfunc] = true;

    let f = function () {
        return this.sub;
    };
    f[bfunc] = true;
    p.smap3 = f;

    var s = new ObjNode({});
    var sp = s.getConProxy();
    sp.cn = function () { return 500 };
    sp.cn2 = function () { return this[parent].dx+500 };
    p.subobj = sp;
    p.subobj.smap2 = function () {
        return this[parent].smap2;
    };
    p.subobj.smap2[bfunc] = true;


    root.finalizeEntireTree();
        
    root.getProp('inpA').value = 'Az';
    root.getProp('inp1').value = 10;
    root.getProp('dx').value = 1000;

    root.computeIfNeeded();

    t.callEq( () => root.getProp('cn0').value, 222 );
    t.callEq( () => root.getProp('sub').getProp('scn').value, 122 );
    t.callEq( () => root.getProp('sub').getProp('inpRepInp0').value, 222);
    t.callEq( () => root.getProp('sub').getProp('inpRepInpA').value, 'Az');
    t.callEq( () => root.getProp('sub').getProp('inpRepInpDx').value, 1000);
    t.callEq( () => root.getProp('sne').enumerable, false );
    t.callEq( () => root.getProp('smap').getProp('scn').value, 122 );
    t.callEq( () => root.getProp('smap2').getProp('scn').value, 1122 );
    t.callEq( () => root.getProp('smap3').getProp('scn').value, 122 );
    //t.callEq( () => root.getDeep(['sbe','c']).value, 831 );
    t.callEq( () => root.nav(['sbe','c']).value, 831 );

    t.callEq( () => root.getProp('subobj').getProp('cn').value, 500 );
    t.callEq( () => root.getProp('subobj').getProp('cn2').value, 1500 );

    root.getProp('dx').value = 2000;
    root.computeIfNeeded();

    t.callEq( () => root.getProp('sub').getProp('inpRepInpDx').value, 2000);
    
    t.callEq( () => root.getProp('smap2').getProp('scn').value, 2122 );
    t.callEq( () => root.getProp('subobj').getProp('cn2').value, 2500 );

    t.callEq( () => root.getProp('smap2').getProp('scn').computeCount, 2);
    t.callEq( () => root.getProp('subobj').getProp('cn2').computeCount, 2);
    
    t.callEq( () => root.getProp('subobj').getProp('smap2').getProp('scn').value, 2122);

    //console.log( p );
    //console.log( p[N] );
    t.callTrue( () => p    !== p[N] );
    t.callTrue( () => p[N] === root );
    t.callTrue( () => conProxyUnwrap(p) === root );
    t.callTrue( () => conProxyUnwrap(root) === root );
    t.callTrue( () => conProxyUnwrap(p) !== p );
    t.callTrue( () => conProxyUnwrap(222) === 222 );
    var otherObj = {};
    t.callTrue( () => conProxyUnwrap(otherObj) === otherObj );
    var otherArray = [];
    t.callTrue( () => conProxyUnwrap(otherArray) === otherArray );
    
    
    //root.logStruct();
    
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

