#!/bin/sh
set -e
if test "$CONFIGURATION" = "Debug"; then :
  cd /Users/viv/GitWorkspace/Hun/Yana/build-xcode/_deps
  /opt/homebrew/bin/cmake -DCMAKE_MESSAGE_LOG_LEVEL=VERBOSE -P /Users/viv/GitWorkspace/Hun/Yana/build-xcode/_deps/corrosion-subbuild/corrosion-populate-prefix/tmp/corrosion-populate-gitclone.cmake
  /opt/homebrew/bin/cmake -E touch /Users/viv/GitWorkspace/Hun/Yana/build-xcode/_deps/corrosion-subbuild/corrosion-populate-prefix/src/corrosion-populate-stamp/$CONFIGURATION$EFFECTIVE_PLATFORM_NAME/corrosion-populate-download
fi

