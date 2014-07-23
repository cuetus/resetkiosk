#!/bin/sh

# Install https://addons.mozilla.org/addon/autoinstaller/ and wget for this to work.

rm -f reset_kiosk.xpi && zip -x *DS_Store* -x README.md -x install.sh -r reset_kiosk.xpi * && wget --post-file=reset_kiosk.xpi http://localhost:8888/ 
