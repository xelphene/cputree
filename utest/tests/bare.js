
'use strict';

const {
    ObjNode, GetSetNode, InputNode,
    parent, bmap,
} = require('../../');

function test(t)
{
    var SYM = Symbol('SYM');
    
    var root = new ObjNode({});
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

    
    root.finalizeEntireTree();
    
    var ix = 1;
    var dx = 10;
    var sub_i = 2;
    
    root.getProp('ix').value = ix;
    root.getProp('dx').value = dx;
    root.getProp('sub').getProp('i').value = sub_i;
    
    root.computeIfNeeded();
    console.log('='.repeat(40));
    root.logStruct();
    console.log('='.repeat(40));
    
    t.callEq( () => root.getProp('sub').getProp('ix1').value, ix+1 );
    t.callEq( () => root.getProp('sub').getProp('si2').value, sub_i*2 );
    t.callEq( () => root.getProp('sub').getProp('sub2').getProp('sscn').value, dx+sub_i );

    //t.callEq( () => root.getDeep(['sub4','sub5','c']).value, 1059 );
    t.callEq( () => root.nav(['sub4','sub5','c']).value, 1059 );

    ix=2;
    root.getProp('ix').value = ix;
    root.computeIfNeeded();
    console.log('='.repeat(40));
    root.logStruct();
    console.log('='.repeat(40));

    t.callEq( () => root.getProp('sub').getProp('ix1').value, ix+1 );

    t.callEq( () => root.getProp('sub').getProp('ix1').computeCount, 2 );
    t.callEq( () => root.getProp('sub').getProp('si2').computeCount, 1 );
    t.callEq( () => root.getProp('sub').getProp('sub2').getProp('sscn').computeCount, 1 );

    dx=100;
    root.getProp('dx').value = dx;
    root.computeIfNeeded();
    console.log('='.repeat(40));
    root.logStruct();
    console.log('='.repeat(40));

    t.callEq( () => root.getProp('sub').getProp('ix1').value, ix+1 );
    t.callEq( () => root.getProp('sub').getProp('si2').value, sub_i*2 );
    t.callEq( () => root.getProp('sub').getProp('sub2').getProp('sscn').value, dx+sub_i );

    t.callEq( () => root.getProp('sub').getProp('ix1').computeCount, 2 );
    t.callEq( () => root.getProp('sub').getProp('si2').computeCount, 1 );
    t.callEq( () => root.getProp('sub').getProp('sub2').getProp('sscn').computeCount, 2 );

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

