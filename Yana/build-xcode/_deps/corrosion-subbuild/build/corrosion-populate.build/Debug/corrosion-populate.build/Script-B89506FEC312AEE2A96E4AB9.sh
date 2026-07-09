#!/bin/sh
set -e
if test "$CONFIGURATION" = "Debug"; then :
  cd /Users/viv/GitWorkspace/Hun/Yana/build-xcode/_deps/corrosion-subbuild
  /opt/homebrew/bin/cmake -Dcfgdir=/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME -P /Users/viv/GitWorkspace/Hun/Yana/build-xcode/_deps/corrosion-subbuild/corrosion-populate-prefix/tmp/corrosion-populate-mkdirs.cmake
  /opt/homebrew/bin/cmake -E touch /Users/viv/GitWorkspace/Hun/Yana/build-xcode/_deps/corrosion-subbuild/corrosion-populate-prefix/src/corrosion-populate-stamp/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME/corrosion-populate-mkdir
fi

