#!/bin/bash
pushd dev
rm -rf backstage_pass.db
sqlite3 backstage_pass.db < create_db.txt
popd