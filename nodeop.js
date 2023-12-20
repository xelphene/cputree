
'use strict';

const {conProxyUnwrap} = require('./tmpl/unwrap');

function listen(n, f) {
    n = conProxyUnwrap(n);
    n.addExtListener(f);
}
exports.listen = listen;
