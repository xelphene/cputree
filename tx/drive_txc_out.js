
'use strict';

const getTree = require('./txc_out');

function main () {
    var root = getTree();
    console.log( root.s.t.g2 );
    console.log( root.s.t.g3 );
}

if( require.main === module )
    main();
