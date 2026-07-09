#!/bin/sh
set -e
if test "$CONFIGURATION" = "Debug"; then :
  cd /Users/viv/GitWorkspace/Hun/Yana/build-xcode/_deps/corrosion-subbuild
  make -f /Users/viv/GitWorkspace/Hun/Yana/build-xcode/_deps/corrosion-subbuild/CMakeScripts/ReRunCMake.make
fi

