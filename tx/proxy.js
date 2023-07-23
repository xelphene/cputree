
'use strict';

const {parent} = require("gobj4");

function getHandler({objNode})
{
    return {
        get: (_, key) => {
            console.log(`PGET for ${key}`);
            if( key===parent) {
                console.log(`  parent`);
            }
            return Reflect.get(objNode, key);
        }
    }
}

function wrap(croot)
{
    return croot;
}
exports.wrap = wrap;
