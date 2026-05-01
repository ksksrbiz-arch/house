#!/usr/bin/env bash
# new-deal.sh — Interactive CLI to create a new deal via Cloudflare Workers API
# Usage: bash scripts/new-deal.sh

set -euo pipefail

if [ -z "${WORKER_URL:-}" ]; then
  echo "❌ WORKER_URL must be set (e.g. https://cathedral-acquisitions.pages.dev)."
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
  "$WORKER_URL/api/deals" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

DEAL_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$DEAL_ID" ]; then
  echo ""
  echo "✅ Deal created!"
  echo "   ID: $DEAL_ID"
else
  echo ""
  echo "❌ Failed to create deal. Response:"
  echo "$RESPONSE"
  exit 1
fi
