#!/usr/bin/env bash
# new-deal.sh — Interactive CLI to create a new deal in Supabase
# Usage: bash scripts/new-deal.sh

set -euo pipefail

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set."
  echo "   Copy .env.example to .env and source it: source .env"
  exit 1
fi

echo ""
echo "🏠 Cathedral Acquisitions — New Deal"
echo "════════════════════════════════════"
echo ""

read -rp "Property address: " ADDRESS
read -rp "City: " CITY
read -rp "State (2-letter): " STATE
read -rp "ZIP: " ZIP
read -rp "Asking price (numbers only): " ASKING_PRICE
read -rp "Number of units: " UNITS
read -rp "Notes (optional): " NOTES

echo ""
echo "Creating deal..."

PAYLOAD=$(cat <<JSON
{
  "address": "$ADDRESS",
  "city": "$CITY",
  "state": "$STATE",
  "zip": "$ZIP",
  "asking_price": $ASKING_PRICE,
  "units": $UNITS,
  "stage": "prospecting",
  "notes": "$NOTES"
}
JSON
)

RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/rest/v1/deals" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "$PAYLOAD")

DEAL_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$DEAL_ID" ]; then
  echo ""
  echo "✅ Deal created!"
  echo "   ID: $DEAL_ID"
  echo "   View: $SUPABASE_URL (Supabase Studio → Table Editor → deals)"
else
  echo ""
  echo "❌ Failed to create deal. Response:"
  echo "$RESPONSE"
  exit 1
fi
