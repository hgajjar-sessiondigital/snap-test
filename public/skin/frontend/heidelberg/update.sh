#!/bin/sh

#################################################################
# COMPILE ALL SASS FILES
#################################################################

# Compile all sass files.
for D in $(find . -mindepth 1 -maxdepth 1 -type d) ; do
    if [ $D != ./default ] && [ $D != ./.sass-cache ]
    	then
		echo $D ;
    	compass compile $D/css ;
    fi
done

exit 0
