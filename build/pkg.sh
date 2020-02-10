#!/usr/bin/env bash
if [ -z "$1" ];
then
    echo "Missing version parameter"
    exit 1
fi
VERSION=$1
# Build
echo "Building binary distribution (warnings are expected)"
npx pkg .
mv nash-linux build/linux/nash
mv nash-macos build/mac/nash
rm -f *.exe
# Package linux version
echo "Packaging linux version..."
cd build/linux
rm -f *.tar *.gz
rm -rf examples
mkdir examples
cp ../../examples/* examples
tar -cf nash-$VERSION-linux.tar *
gzip nash-$VERSION-linux.tar
mv nash-$VERSION-linux.tar.gz ../../dist
rm -rf examples
rm nash
# Package linux version
echo "Packaging mac version..."
cd ../mac
rm -f *.tar *.gz
rm -rf examples
mkdir examples
cp ../../examples/* examples
tar -cf nash-$VERSION-mac.tar *
gzip nash-$VERSION-mac.tar
mv nash-$VERSION-mac.tar.gz ../../dist
rm -rf examples
rm nash
echo "Done."