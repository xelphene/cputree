
'use strict';

const {constructorize, parent, inpdef, subobj, CTL, sub} = require('../../');

function test(t) 
{
    var Inner = {
        xx: inpdef.any(),
        yy: inpdef.any(),
        aa: inpdef.any(),
        scY: function () {
            return this.yy*10;
        },
        scX: function () {
            return this.xx*10;
        },
        [sub]: true,
    }

    var InnerC = constructorize(Inner);

    var Outer = {
        x: inpdef.any(),
        y: inpdef.any(),
        a: function () {
            var c = this.x+1;
            return c;
        },
        j: function () {
            return this.x+this.a
        },
        accessWithinSub: function () {
            var v = this.s.yy;
            return v;
        },
        [sub]: true,
        //s: subobj(Inner, {xx:'x', aa:'a', yy: 'y'}),
        s: Inner,
    };
    Outer.s.xx.refCN = function () { return this[parent].x };
    Outer.s.aa.refCN = function () { return this[parent].a };
    Outer.s.yy.refCN = function () { return this[parent].y };

    var OuterC = constructorize(Outer);

    var root = new OuterC();
    var rooti = new InnerC();
        
    root.x = 21;
    root.y = 10;
    
    t.callEq( () => root.x, 21 );
    t.callEq( () => root.y, 10 );
    t.callEq( () => root.a, 22 );
    t.callEq( () => root.accessWithinSub, 10 );
    t.callEq( () => root.j, 43 );
    t.callEq( () => root.s.scY, 100 );
    t.callEq( () => root.s.scX, 210 );

    t.callEq( () => root.s[CTL].getProp('scY').computeCount, 1 );
    root[CTL].computeIfNeeded();
    t.callEq( () => root.s[CTL].getProp('scY').computeCount, 1 );

    root.y = 100;
    
    // invoke lazy computes
    root[CTL].computeIfNeeded();

    t.callEq( () => root.s.scY, 1000 );

    t.callEq( () => root[CTL].getProp('a').computeCount, 1 );
    t.callEq( () => root.s[CTL].getProp('scY').computeCount, 2 );
    t.callEq( () => root.s[CTL].getProp('scX').computeCount, 1 );
}
exports.test = test;

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

