
'use strict';

const {C, N, O, ObjNode, InputNode, GetSetNode, parent} = require('../../');

var root;
const ix = 1;
const dx = 10;
const sub_i = 2;

beforeEach( () => {
    var SYM = Symbol('SYM');
    
    root = new ObjNode({});
    root.add('ix', new InputNode({}));
    root.add('dx', new InputNode({}));
    
    var sub = new ObjNode({});
    root.add('sub', sub);
    sub.add('ix1', new GetSetNode({
        getter: function () {
            return this[parent].ix+1
        }
    }));
    sub.add('i', new InputNode({}));
    sub.add('si2', new GetSetNode({
        getter: function () {
            return this.i*2
        }
    }));
    
    var sub2 = new ObjNode({});
    sub.add('sub2',sub2);
    sub2.add('sscn', new GetSetNode({
        getter: function () {
            return this[parent].i + this[parent][parent].dx
        }
    }));
    sub2.add('addCN', new GetSetNode({
        getter: function () {
            return 222;
        }
    }));

    var sub3 = new ObjNode({});
    sub.add('sub3',sub3);
    sub3.add('keepMe', new GetSetNode({
        getter: function () {
            return 111;
        }
    }));
    sub3.add('overrideMe', new GetSetNode({
        getter: function () {
            return -900;
        }
    }));

    root.add(['sub4','sub5','c'], new GetSetNode({
        getter: function () {
            return 1059;
        }
    }));

    
    //root.finalizeEntireTree();
    //root.getProp('ix').value = ix;
    //root.getProp('dx').value = dx;
    //root.getProp('sub').getProp('i').value = sub_i;
    root.init({
        ix,
        dx,
        sub: {
            i: sub_i
        }
    });

    root.computeIfNeeded();
});

test('basic values', () => {
    expect( root.getProp('sub').getProp('ix1').value ).toBe( ix+1 );
    expect( root.getProp('sub').getProp('si2').value ).toBe( sub_i*2 );
    expect( root.getProp('sub').getProp('sub2').getProp('sscn').value ).toBe( dx+sub_i );
    expect( root.nav(['sub4','sub5','c']).value ).toBe( 1059 );
});

test('modify 1', () => {
    var ix=2;
    root.getProp('ix').value = ix;
    root.computeIfNeeded();

    expect( root.nav('sub.ix1').value ).toBe( ix+1 );

    expect( root.nav('sub.ix1').computeCount ).toBe( 2 );
    expect( root.nav('sub.si2').computeCount ).toBe( 1 );
    expect( root.nav('sub.sub2.sscn').computeCount ).toBe( 1 );
});

test('modify 2', () => {
    var ix=2;
    root.getProp('ix').value = ix;
    root.computeIfNeeded();

    var dx=100;
    root.getProp('dx').value = dx;
    root.computeIfNeeded();

    expect( root.nav('sub.ix1').value ).toBe( ix+1 );
    expect( root.nav('sub.si2').value ).toBe( sub_i*2 );
    expect( root.nav('sub.sub2.sscn').value ).toBe( dx+sub_i );

    expect( root.nav('sub.ix1').computeCount ).toBe( 2 );
    expect( root.nav('sub.si2').computeCount ).toBe( 1 );
    expect( root.nav('sub.sub2.sscn').computeCount ).toBe( 2 );
    
});
