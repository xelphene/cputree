
'use strict';

const {parent,root, PARENT_STR, ROOT_STR} = require('./consts');

function isValidPathArray(x) {
    if( Array.isArray(x) ) {
        for( let i of x ) {
            if( ! typeof(i)=='string' && ! typeof(i)=='symbol' )
                return false;
        }
    } else
        return false;
    
    return true;
}
exports.isValidPathArray = isValidPathArray;


function parseStr(s)
{
    /*
    return s.split('.').map(
        pc => pc=='^' ? parent : pc
    );
    */
    return s.split('.').map(
        pc => {
            if( pc == PARENT_STR )
                return parent;
            else if( pc == ROOT_STR )
                return root;
            else
                return pc;
        }
    );
}


class Path
{
    constructor(spec) {
        if( typeof(spec)=='string' )
            spec = parseStr(spec);
        
        if( ! isValidPathArray(spec) )
            throw new Error(`invalid path specification`);

        this._path = spec;
        
        
    }
    
    pathStr() {
        let rv = [];
        for( let pc of this._path )
            if( pc===parent )
                rv.push(PARENT_STR);
            else if( pc===root )
                rv.push(ROOT_STR);
            else if( typeof(pc)==='symbol' )
                rv.push( '['+pc.toString().slice(7,-1)+']' );
            else
                rv.push(pc.toString());
        return rv.join('.');
    }

    pathPureStr() {
        let rv = [];
        for( let pc of this._path )
            if( typeof(pc)=='string' )
                rv.push(pc);
            else
                throw new Error(`Unable to convert path ${this.toString()} to a pure string as it contains a non-string path component`);
        return rv.join('.');
    }
    
    get hasOnlyStringParts () {
        return this._path
            .map( p => typeof(p) )
            .reduce( (a,b) => a=='string' && b=='string' ? 'string' : '' )
            == 'string'
    }
    
    get array () { return this._path }
    
    concat(o) {
        if( ! (o instanceof Path) )
            throw new Error(`Path instance required`);
        return new Path(this._path.concat( o.array ));
    }
    
    append(e) {
        return new Path( this._path.concat([e]) );
    }
    
    prepend(e) {
        return new Path( [e].concat(this._path) );
    }
    
    prependRoot() {
        return new Path( [root].concat(this._path) );
    }
    
    toString() {
        return this.pathStr();
    }
    
    toStringExact() {
        if( ! this.hasOnlyStringParts )
            throw new Error(`cannot convert a path with non-string components to an exact string`);
        return this.toString();
    }
    
    slice(i, j) {
        return new Path(this._path.slice(i, j));
    }
    
    get length () { return this._path.length }
    
    get first () { return this._path[0] }
    
    get last () { return this._path[this._path.length-1] }
    
    get allExceptLast () { return this.slice(0,-1) }
    
    get rest () { return this.slice(1) }
    
    equals(other) {
        if( this.length != other.length )
            return false;
        for( let i=0; i<this.length; i++ )
            if( this.array[i]!==other.array[i] )
                return false;
        return true;
    }
    
    geti(index) { return this._path[index] }
    
    reverse() {
        return toPath(this._path.reverse());
    }
}
exports.Path = Path;

function toPath (v) {
    if( v instanceof Path )
        return v;
    else if( Array.isArray(v) )
        return new Path(v);
    else if( typeof(v)=='string' )
        return new Path( parseStr(v) );
    else if( typeof(v)=='symbol' )
        return new Path([v]);
    else
        throw new Error('invalid path');
}
exports.toPath = toPath;
