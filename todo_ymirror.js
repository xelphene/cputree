
'use strict';

var Circles = {
    x1: input(),
    y1: input(),
    x2: input(),
    y2: input(),
    center1: function () { return new Point(x1,y1) },
    center2: function () { return new Point(x2,y2) },
    c1: function () {
        return new Circle({center: this.center1, radius: 1});
    },
    c2: function () {
        return new Circle({center: this.center2, radius: 2});
    },
}

var CirclesYM = {
    x1: input(),
    y1: input(),
    x2: input(),
    y2: input(),
    center1: function () { return new Point(x1,y1).ymirror() },
    center2: function () { return new Point(x2,y2).ymirror() },
    c1: function () {
        return new Circle({center: this.center1, radius: 1});
    },
    c2: function () {
        return new Circle({center: this.center2, radius: 2});
    },
}

var Outer = {
    x1: input(),
    y1: input(),
    x2: input(),
    y2: input(),
    
    c: subobj(Circles, {x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2'});
    c: {
        template,
        x1: reflect_parent,
        y1: reflect_parent,
        x2: reflect_parent,
        y2: reflect_parent,
        center1: function () { return new Point(x1,y1) },
        center2: function () { return new Point(x2,y2) },
    },
    
    // all equivalent:
    cYM: subobj_ymirror('c'),
    cYM: subobj_map('c', i => i.ymirror());
    cYM: subobj(CirclesYM, {x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2'});
};

var o = new Outer();

o.x1 = 10;
o.y1 = 10;
o.x2 = 20;
o.y2 = 10;
// c and cYM are computed

o.x2 = 30;
o.y2 = 10;
// only c.c2 and cYM.c2 are compouted
