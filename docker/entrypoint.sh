#!/bin/sh
set -e
# Applique le schéma Prisma au démarrage (idempotent) puis lance le serveur.
if [ "${SKIP_DB_PUSH:-0}" != "1" ]; then
  node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss >/dev/null 2>&1 || \
  npx prisma db push --skip-generate || true
fi
exec "$@"
