#!/bin/bash

# clean start on reinitializing the submodule
git submodule deinit -f submodules/crowd.dev
git rm -f submodules/crowd.dev
rm -rf .git/modules/submodules/crowd.dev
rm -rf submodules/crowd.dev
sed -i '/crowd\.dev/,+2d' .gitmodules

# create the submodule directory and add the submodule
mkdir -p submodules
git submodule add -b main git@github.com:CrowdDotDev/crowd.dev.git submodules/crowd.dev
git add .gitmodules submodules/crowd.dev
cd submodules/crowd.dev || exit 1

# enable sparse checkout and specify the folders
git sparse-checkout init --no-cone
git sparse-checkout set \
  /services/base.tsconfig.json \
  /services/libs/database \
  /services/libs/telemetry \
  /services/libs/snowflake \
  /services/libs/temporal \
  /services/libs/logging \
  /services/libs/opensearch \
  /services/libs/types \
  /services/libs/common \
  /services/libs/common_services \
  /services/libs/audit-logs \
  /services/libs/data-access-layer \
  /services/libs/integrations \
  /services/libs/slack \
  /services/libs/questdb \
  /services/libs/queue \
  /services/libs/redis \
  /services/archetypes
