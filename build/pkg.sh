#!/usr/bin/env bash

function nash_package() {
    PLATFORM=$1
    rm -f *.tar *.gz
    tar -cf nash-$VERSION-$PLATFORM.tar *
    gzip nash-$VERSION-$PLATFORM.tar
    mv nash-$VERSION-$PLATFORM.tar.gz ../../dist
    rm nash
}

if [ -z "$1" ];
then
    echo "Missing version parameter"
    exit 1
fi
VERSION=$1
# Build
echo "Building binary distribution (warnings are expected)"
mkdir -p dist
npx pkg --targets linux,macos .
mv bnash-linux build/linux/nash
mv bnash-macos build/mac/nash
# Package linux version
echo "Packaging linux version..."
cd build/linux
nash_package linux
# Package linux version
echo "Packaging mac version..."
cd ../mac
nash_package mac
echo "Done."