#!/bin/bash

echo "Linking dev migrations to test..."
rm -rf tests/supabase/migrations
cp -r supabase/migrations tests/supabase/migrations

