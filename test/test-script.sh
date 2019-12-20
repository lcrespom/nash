#!/usr/bin/env bash
echo "Param 1:" $1
echo "Param 2:" $2
echo "Param 3:" $3
echo "Param 4:" $4
echo -n "Shell is: "
echo $(ps -p $$ | cut -f 7 -d " ")
