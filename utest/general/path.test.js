
'use strict';

const {
    ObjNode, AliasValidateNode, InputNode, GetSetNode, errors, parent
} = require('../../');

var root, a, a_cn, b, c, c_cn, c_cn3;

beforeEach( () =>
{
    root = new ObjNode({});

    a = new ObjNode({});
    root.add('a', a);
    a_cn =  new GetSetNode({
        getter: () => 1
    });
    a.add('cn',a_cn);

    b = new ObjNode({});
    root.getProp('a').add('b', b);

    c = new ObjNode({});
    root.getProp('a').getProp('b').add('c', c);
    c_cn = new GetSetNode({
        getter: () => 2
    })
    c.add('cn', c_cn);
    
    c_cn3 = new GetSetNode({
        getter: () => 3
    })
    c.add('cn3', c_cn3);

    root.finalizeEntireTree();
    root.computeIfNeeded();
});

test('Node.nearestCommonAncestor works', () => 
{
    expect( c.nearestCommonAncestor(c_cn)    ).toStrictEqual( c    );
    expect( a_cn.nearestCommonAncestor(c_cn) ).toStrictEqual( a    );
    expect( c_cn.nearestCommonAncestor(c_cn) ).toStrictEqual( c_cn );
    expect( c_cn.nearestCommonAncestor(b)    ).toStrictEqual( b    );
    expect( b.nearestCommonAncestor(c_cn)    ).toStrictEqual( b    );
});

test('Node.nodesToAncestor works', () =>
{
    expect( c_cn3.nodesToAncestor(c)[0] ).toStrictEqual( c_cn3 );
    expect( c_cn3.nodesToAncestor(c)[1] ).toStrictEqual( c );
});


test('Node.pathToNode works', () =>
{
    expect( c_cn3.pathToNode(a_cn).array[0] ).toStrictEqual( parent );
    expect( c_cn3.pathToNode(a_cn).array[1] ).toStrictEqual( parent );
    expect( c_cn3.pathToNode(a_cn).array[2] ).toStrictEqual( parent );
    expect( c_cn3.pathToNode(a_cn).array[3] ).toStrictEqual( 'cn' );
    
    expect( a_cn.pathToNode(c_cn3).array[0] ).toStrictEqual( parent );
    expect( a_cn.pathToNode(c_cn3).array[1] ).toStrictEqual( 'b' );
    expect( a_cn.pathToNode(c_cn3).array[2] ).toStrictEqual( 'c' );
    expect( a_cn.pathToNode(c_cn3).array[3] ).toStrictEqual( 'cn3' );

    expect( c_cn3.nav( c_cn3.pathToNode(a_cn) ) ).toStrictEqual( a_cn );
    
    expect( a_cn.nav( a_cn.pathToNode(c_cn3) ) ).toStrictEqual( c_cn3 );
});
    
test('Node.nav fails right', () =>
{
    expect( () => a_cn.nav([parent,'asdf']) ).toThrow( errors.NavError );
    expect( () => a_cn.nav([parent,'cn','asdf']) ).toThrow( errors.NavError );
    expect( () => a_cn.nav([parent,parent,parent]) ).toThrow( errors.NavError );
});
