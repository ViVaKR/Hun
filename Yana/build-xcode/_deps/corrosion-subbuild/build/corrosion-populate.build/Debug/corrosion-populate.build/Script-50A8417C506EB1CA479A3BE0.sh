#!/bin/sh
set -e
if test "$CONFIGURATION" = "Debug"; then :
  cd /Users/viv/GitWorkspace/Hun/Yana/build-xcode/_deps/corrosion-src
  /opt/homebrew/bin/cmake -Dcan_fetch=YES -DCMAKE_MESSAGE_LOG_LEVEL=VERBOSE -P /Users/viv/GitWorkspace/Hun/Yana/build-xcode/_deps/corrosion-subbuild/corrosion-populate-prefix/tmp/corrosion-populate-gitupdate.cmake
fi

