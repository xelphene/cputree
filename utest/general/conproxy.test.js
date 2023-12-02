
'use strict';

const {
    ObjNode, MapObjNode, ComputeNode, InputNode,
    parent, bmap, bfunc, enumerable, bexist, inpn,
    conProxyUnwrap, C, N, O
} = require('../../');

var root;
var p;

beforeEach( () =>
{
    root = new ObjNode({});
    p = root.getConProxy();
    
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
});

test('init', () => {
    expect( root.getProp('cn0').value ).toBe( 222 );
    expect( root.getProp('sub').getProp('scn').value ).toBe( 122 );
    expect( root.getProp('sub').getProp('inpRepInp0').value ).toBe( 222);
    expect( root.getProp('sub').getProp('inpRepInpA').value ).toBe( 'Az');
    expect( root.getProp('sub').getProp('inpRepInpDx').value ).toBe( 1000);
    expect( root.getProp('sne').enumerable ).toBe( false );
    expect( root.getProp('smap').getProp('scn').value ).toBe( 122 );
    expect( root.getProp('smap2').getProp('scn').value ).toBe( 1122 );
    expect( root.getProp('smap3').getProp('scn').value ).toBe( 122 );
    //expect( root.getDeep(['sbe','c']).value ).toBe( 831 );
    expect( root.nav(['sbe','c']).value ).toBe( 831 );

    expect( root.getProp('subobj').getProp('cn').value ).toBe( 500 );
    expect( root.getProp('subobj').getProp('cn2').value ).toBe( 1500 );
});

test('update', () =>
{
    root.getProp('dx').value = 2000;
    root.computeIfNeeded();

    expect( root.getProp('sub').getProp('inpRepInpDx').value ).toBe( 2000);
    
    expect( root.getProp('smap2').getProp('scn').value ).toBe( 2122 );
    expect( root.getProp('subobj').getProp('cn2').value ).toBe( 2500 );

    expect( root.getProp('smap2').getProp('scn').computeCount ).toBe( 2);
    expect( root.getProp('subobj').getProp('cn2').computeCount ).toBe( 2);
    
    expect( root.getProp('subobj').getProp('smap2').getProp('scn').value ).toBe( 2122);
});

test('unwrap', () =>
{
    expect( p    !== p[N] ).toBe( true );
    expect( p[N] === root ).toBe( true );
    expect( conProxyUnwrap(p) === root ).toBe( true );
    expect( conProxyUnwrap(root) === root ).toBe( true );
    expect( conProxyUnwrap(p) !== p ).toBe( true );
    expect( conProxyUnwrap(222) === 222 ).toBe( true );
    var otherObj = {};
    expect( conProxyUnwrap(otherObj) === otherObj ).toBe( true );
    var otherArray = [];
    expect( conProxyUnwrap(otherArray) === otherArray ).toBe( true );

    //root.logStruct();
});
