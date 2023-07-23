
'use strict';

const getTree = require('./exin').getTree;
const fs = require('fs');

function xpile(root, lines, where)
{
    if( where.length > 1 ) {
        lines.push(`Object.defineProperty(${where.join('.')}, parent, {`);
        lines.push(`    get: () => ${where.slice(0,-1).join('.')}`);
        lines.push(`});`);
    }
    for( let n of root.iterChildren() ) {
        console.log(`key: ${n.key} nodeType: ${n.nodeType}`);
        if( n.nodeType=='compute' ) {
            lines.push(`Object.defineProperty(${where.join('.')}, ${JSON.stringify(n.key)}, {`);
            lines.push(`    get: ${n.computeFunc.toString()}`);
            lines.push(`});`);
        } else if( n.nodeType=='obj' ) {
            lines.push(`Object.defineProperty(${where.join('.')}, ${JSON.stringify(n.key)}, {`);
            lines.push(`    value: {}`);
            lines.push(`});`);
            xpile(n, lines, where.concat(n.key) );
        }
    }
    
    return lines;
}

function main () 
{
    var root = getTree();

    var lines = [
        '"use strict"',
        'const {parent} = require("gobj4");',
        'const wrap = require("./proxy").wrap;',
        'module.exports = function  () {',
        'var root = {};',
    ];
    
    xpile(root, lines, ['root']);
    
    lines.push('return wrap(root);');
    lines.push('}');
    lines.push('');
    
    console.log( '='.repeat(80) );
    var src = lines.join('\n');
    
    fs.writeFileSync('txc_out.js', src);
}

if( require.main === module )
    main();
