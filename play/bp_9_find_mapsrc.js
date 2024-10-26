
'use strict';

const {tbuild, unwrap, tinsert, bexist} = require('../tbuild');

var R = tbuild();

// TODO: also make a simple input symbol
R.i  = tinsert.input(3);
R.j  = tinsert.input(6);
R.c  = t => 222;
R.md = t => 2;
R.f1 = t => t.c + 1;
R.f2 = t => t.i*10000;

R.o = bexist;
R.o.i = tinsert.input(9);
R.o.f = t => t.i + t.o.i;
R.o.j = t => t.j;

const inc10 = (t,v) => v+10;
const dec10 = (t,v) => v-10;

const inc100 = (t,v) => v+100;
const dec100 = (t,v) => v-100;

//R.m  = tinsert.mapSplit( R.o, (t,v) => v * t.md, (t,v) => v / t.md );
//R.n  = tinsert.mapSplit( R.o, (t,v) => v+1, (t,v) => v-1 );
//R.m2 = tinsert.mapSplit( R.m, (t,v) => v+2, (t,v) => v-2 );

R.t  = tinsert.mapSplit( R.o, inc10, dec10 )
R.t2 = tinsert.mapSplit( R.t, inc10, dec10 )
R.s  = tinsert.mapSplit( R.o, inc10, dec10 )
R.S  = tinsert.mapSplit( R.s, inc100, dec100 )

////////////////////////////

R = unwrap(R);
R.init({});
console.log( R.rawObject );

//////////////////////////////////////////////////

const multif = (f,a,n,c) => {
    if( c===undefined ) c=1;
    if( c==n )
        return f(a)
    else
        return f( multif(f,a,n,c+1) )
}
console.log( multif(x => x+10, 1, 3) )

////

function callStack (stack, arg) {
    if( stack.length==1 )
        return stack[0].invokeMapGetFunc(arg)
    else
        return stack[0].invokeMapGetFunc(
            callStack( stack.slice(1), arg )
        )
}

function callStackSet (stack, arg) {
    if( stack.length==1 )
        return stack[0].invokeMapSetFunc(arg)
    else
        return stack[0].invokeMapSetFunc(
            callStackSet( stack.slice(1), arg )
        )
}

const base = R.nav('o.f');
console.log(`map tree for ${base.fullName} using inc10/dec10:`);
//const iter = base.iterMapNodes({ mapGetFunc: inc10, mapSetFunc: dec10 });
const iter = base.iterMapNodes({});
for( let [n,stack] of iter ) {
    const ts = stack.slice(1).reverse();
    const ss = ts.map(n => n.fullName).join(', ');
    const mv = callStackSet(ts, 1000);

    console.log(`${'  '.repeat(ts.length)}${n.fullName} <<  ${ss} >> ${mv}`);
    
    //const cv = callStack( stack.slice(1), 1000 )
    //console.log(`${' '.repeat(stack.length)}${n.fullName} == ${n.value}  <<  ${ss} >> ${cv}`);

    //console.log(`${' '.repeat(stack.length)}${n.fullName} == ${n.value}  <<  ${ss} >> ${rv}`);

}

///
console.log('/ / / / / /');
console.log( R.nav('s.f').invokeMapGetFunc(100) );
console.log( R.nav('s.f').invokeMapSetFunc(100) );
//R.nav('s').logDebug();

console.log('/ / / / / /');

console.log( R.nav('t2.f').testRevValue( 1000 ) );
console.log( R.nav('S.f').testRevValue( 1000 ) );

console.log( R.nav('t2.f').testRevValue( 32 ) );
console.log( R.nav('S.f').testRevValue( 122 ) );

console.log('/ / / / / /');

console.log( R.nav('S.f').testRevValue( 122, R.nav('s.f') ) );
