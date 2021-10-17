#!/bin/bash
echo "BUILD" && \
cp -r ../snapcraft/bin ../src/ && \
cp -r ../snapcraft/snap ../src/ && \
cd ../src && \
pwd && \
snapcraft
