#!/bin/bash
# Worker queue CONSTRUIRO — à lancer via Supervisor en production
# Supervisor config exemple : /etc/supervisor/conf.d/construiro-worker.conf

php artisan queue:work \
    --sleep=3 \
    --tries=3 \
    --max-time=3600 \
    --queue=default,emails \
    --timeout=60
