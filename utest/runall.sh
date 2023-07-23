#!/bin/bash

ls tests/*.js | while read f; do
	res=`node $f | grep TEST_RESULT:`
	printf '%-35s%s\n' $f "$res"
done
