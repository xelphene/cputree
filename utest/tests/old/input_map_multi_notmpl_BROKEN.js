
'use strict';

const {
    ObjNode, MapObjNode, ComputeNode, InputNode,
    parent, bmap, tmpl, bfunc, enumerable, bexist,
} = require('../../');


function test (t) {

const number = tmpl.inpdef.number;

var o = new ObjNode({});

o.addDeep(['isrc'], new ObjNode({}));
o.addDeep(['tomap'], new ObjNode({}));
o.addDeep(['tomap','s1'], new ObjNode({}));
o.addDeep(['s'], new ObjNode({}));
o.addDeep(['s','tomap'], new ObjNode({}));
o.addDeep(['s','tomap','s1'], new ObjNode({}));
o.addDeep(['s','b'], new ObjNode({}));
o.addDeep(['s','b','tomap'], new ObjNode({}));
o.addDeep(['s','b','tomap','s1'], new ObjNode({}));



o.nav(['isrc']).add('inp0', new InputNode({}));
o.nav(['isrc']).add('inp1', new InputNode({}));
o.nav(['isrc','s1']).add('inp2', new InputNode({}));


o.nav(['b','isrc']).add('inp0', new InputNode({}));
o.nav(['b','isrc']).add('inp1', new InputNode({}));
o.nav(['b','isrc','s1']).add('inp2', new InputNode({}));

////////////

o.nav(['tomap']).add('inp0', new InputNode({}));
o.nav(['tomap']).add('inp1', new InputNode({}));
o.nav(['tomap','s1']).add('inp2', new InputNode({}));

o.nav(['s','tomap']).add('inp0', new InputNode({}));
o.nav(['s','tomap']).add('inp1', new InputNode({}));
o.nav(['s','tomap','s1']).add('inp2', new InputNode({}));

o.nav(['s','b','tomap']).add('inp0', new InputNode({}));
o.nav(['s','b','tomap']).add('inp1', new InputNode({}));
o.nav(['s','b','tomap','s1']).add('inp2', new InputNode({}));


////////////////////////////////////////////


o.getProp('tomap').treeInputMap( o.getProp('isrc') );
o.getProp('s').getProp('tomap').treeInputMap( o.getProp('isrc') );
o.getProp('s').getProp('b').getProp('tomap').treeInputMap( o.getProp('b').getProp('isrc') );

//console.log('');
//console.log('//////');
//console.log('');

o.finalizeEntireTree();

o.getProp('isrc').getProp('inp0').value = 0;
o.getProp('isrc').getProp('inp1').value = 1;
o.getProp('isrc').getProp('s1').getProp('inp2').value = 2;
o.getProp('b').getProp('isrc').getProp('inp0').value = 1000;
o.getProp('b').getProp('isrc').getProp('inp1').value = 1001;
o.getProp('b').getProp('isrc').getProp('s1').getProp('inp2').value = 1002;

o.computeIfNeeded();
//o.logStruct();

var oo = o.rawObject;

t.callEq( () => oo.tomap.s1.inp2, 2 );
t.callEq( () => oo.tomap.inp0, 0 );
t.callEq( () => oo.tomap.inp1, 1 );

t.callEq( () => oo.s.tomap.s1.inp2, 2 );
t.callEq( () => oo.s.tomap.inp0, 0 );
t.callEq( () => oo.s.tomap.inp1, 1 );

t.callEq( () => oo.s.b.tomap.s1.inp2, 1002 );
t.callEq( () => oo.s.b.tomap.inp0, 1000 );
t.callEq( () => oo.s.b.tomap.inp1, 1001 );

t.callEq( () => o.getProp('s').getProp('tomap').getProp('s1').getProp('inp2').computeCount, 1 );
oo.isrc.s1.inp2 = 20;
t.callEq( () => oo.s.tomap.s1.inp2, 20 );
t.callEq( () => o.getProp('s').getProp('tomap').getProp('s1').getProp('inp2').computeCount, 2 );
t.callEq( () => o.getProp('s').getProp('tomap').getProp('inp1').computeCount, 1 );

o.logStruct();

return;

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

