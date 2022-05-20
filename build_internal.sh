#!/bin/bash

cd docker

#export BACKEND_BUILD_TAG=build-rel-18
#export FRONTEND_BUILD_TAG=build-rel-18
#export IMAGE_TAG=stable
#./internal.sh
#
#export BACKEND_BUILD_TAG=build-rel-18_TEST
#export FRONTEND_BUILD_TAG=build-rel-18_TEST
#export IMAGE_TAG=latest
#./internal.sh
#
#export BACKEND_BUILD_TAG=build-rel-18_FEATURE
#export FRONTEND_BUILD_TAG=build-rel-18_FEATURE
#export IMAGE_TAG=dev
#./internal.sh

export BACKEND_BUILD_TAG=build-rel-18_FEATURE
export FRONTEND_BUILD_TAG=build-rel-18_FEATURE
export SSP_BUILD_TAG=build-rel-18_FEATURE
export IMAGE_TAG=dev
./internal.sh


