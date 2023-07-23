#!/bin/bash

tests='
bare.js
applyinput.js
input_map_multi.js
path.js
conproxy.js
'

for path in $tests; do
	res=`node tests/$path | grep TEST_RESULT:`
	printf '%-30s%s\n' $f "$res"
done
