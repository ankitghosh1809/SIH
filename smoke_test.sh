#!/bin/bash
# Smoke test: exercises every real endpoint exactly as the wired frontend hooks
# call it (same paths, field names, content-types) against a live backend.
set -e
API=http://localhost:8000
ORIGIN=http://localhost:3000
PASS=0
FAIL=0

check() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    PASS=$((PASS+1)); echo "OK   $desc"
  else
    FAIL=$((FAIL+1)); echo "FAIL $desc (expected $expected, got $actual)"
  fi
}

echo "== CORS preflight (as the browser would send it from the Vite dev origin) =="
CORS_HDR=$(curl -s -i -X OPTIONS "$API/api/v1/scans" \
  -H "Origin: $ORIGIN" -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" | grep -i "access-control-allow-origin" || true)
echo "$CORS_HDR"
[ -n "$CORS_HDR" ] && check "CORS allows the Vite dev origin" "1" "1" || check "CORS allows the Vite dev origin" "1" "0"

echo ""
echo "== Auth: register + login for all 3 roles =="
for role in camp_staff doctor admin; do
  CODE=$(curl -s -o /tmp/reg_$role.json -w "%{http_code}" -X POST "$API/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"smoke_$role\",\"password\":\"testpass123\",\"role\":\"$role\",\"full_name\":\"Smoke Test\"}")
  check "register $role" "201" "$CODE"
done

TOKEN_ADMIN=$(curl -s -X POST "$API/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=smoke_admin&password=testpass123" | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
TOKEN_DOCTOR=$(curl -s -X POST "$API/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=smoke_doctor&password=testpass123" | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
[ -n "$TOKEN_ADMIN" ] && check "admin login returned a token" "1" "1" || check "admin login returned a token" "1" "0"

ME_CODE=$(curl -s -o /tmp/me.json -w "%{http_code}" "$API/api/v1/auth/me" -H "Authorization: Bearer $TOKEN_ADMIN")
check "GET /auth/me with token" "200" "$ME_CODE"

echo ""
echo "== Patients: create, then search (exercises the usePatientSearch fix) =="
PATIENT_JSON=$(curl -s -X POST "$API/api/v1/patients" -H "Content-Type: application/json" \
  -d '{"full_name":"Asha Verma","age":54,"gender":"female","diabetes_type":"type2"}')
echo "$PATIENT_JSON"
PATIENT_ID=$(echo "$PATIENT_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
[ -n "$PATIENT_ID" ] && check "patient created, has id" "1" "1" || check "patient created, has id" "1" "0"

SEARCH_JSON=$(curl -s "$API/api/v1/patients?search=Asha")
echo "$SEARCH_JSON"
FOUND=$(echo "$SEARCH_JSON" | python3 -c "
import sys,json
rows=json.load(sys.stdin)
print('1' if any(r['id']=='$PATIENT_ID' and r['full_name']=='Asha Verma' for r in rows) else '0')
")
check "search returns id+full_name matching PatientLinkField's fixed field access" "1" "$FOUND"

echo ""
echo "== Screening: single upload exactly as useUploadScan.ts sends it =="
SCAN_JSON=$(curl -s -X POST "$API/api/v1/scans" \
  -F "file=@/home/claude/work/test-fundus-1.png" \
  -F "patient_name=Asha Verma" \
  -F "patient_id=$PATIENT_ID")
echo "$SCAN_JSON"
SCAN_ID=$(echo "$SCAN_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['scan_id'])")
RISK=$(echo "$SCAN_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['risk_level'])")
[ -n "$SCAN_ID" ] && check "single upload returns ScanResponse with scan_id" "1" "1" || check "single upload returns ScanResponse with scan_id" "1" "0"

echo ""
echo "== Screening: batch upload exactly as useBatchUpload.ts sends it (repeated 'files' field) =="
BATCH_JSON=$(curl -s -X POST "$API/api/v1/batch" \
  -F "files=@/home/claude/work/test-fundus-1.png" \
  -F "files=@/home/claude/work/test-fundus-2.png" \
  -F "files=@/home/claude/work/bad-file.png")
echo "$BATCH_JSON"
BATCH_TOTAL=$(echo "$BATCH_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['summary']['total'])")
BATCH_FAILED=$(echo "$BATCH_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['summary']['failed'])")
check "batch of 3 (1 bad) -> total=3" "3" "$BATCH_TOTAL"
check "batch isolates the 1 bad file as failed, doesn't abort the rest" "1" "$BATCH_FAILED"

echo ""
echo "== Scans: list/detail/explain/referral-suggestion exactly as useScan.ts calls them =="
LIST_CODE=$(curl -s -o /tmp/list.json -w "%{http_code}" "$API/api/v1/scans?limit=20")
check "GET /scans?limit=20" "200" "$LIST_CODE"
DETAIL_CODE=$(curl -s -o /tmp/detail.json -w "%{http_code}" "$API/api/v1/scans/$SCAN_ID")
check "GET /scans/{id}" "200" "$DETAIL_CODE"
EXPLAIN_CODE=$(curl -s -o /tmp/explain.json -w "%{http_code}" "$API/api/v1/scans/$SCAN_ID/explain")
check "GET /scans/{id}/explain" "200" "$EXPLAIN_CODE"
SUGGEST_CODE=$(curl -s -o /tmp/suggest.json -w "%{http_code}" "$API/api/v1/scans/$SCAN_ID/referral-suggestion")
check "GET /scans/{id}/referral-suggestion" "200" "$SUGGEST_CODE"
HEATMAP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/v1/scans/$SCAN_ID/heatmap")
check "GET /scans/{id}/heatmap" "200" "$HEATMAP_CODE"

echo ""
echo "== Patients: scan history + trend for the linked patient =="
PSCANS_CODE=$(curl -s -o /tmp/pscans.json -w "%{http_code}" "$API/api/v1/patients/$PATIENT_ID/scans")
check "GET /patients/{id}/scans" "200" "$PSCANS_CODE"
PTREND_CODE=$(curl -s -o /tmp/ptrend.json -w "%{http_code}" "$API/api/v1/patients/$PATIENT_ID/trend")
check "GET /patients/{id}/trend" "200" "$PTREND_CODE"

echo ""
echo "== Doctor review: role-gated POST exactly as the review workflow would call it =="
REVIEW_CODE=$(curl -s -o /tmp/review.json -w "%{http_code}" -X POST "$API/api/v1/scans/$SCAN_ID/review" \
  -H "Authorization: Bearer $TOKEN_DOCTOR" -H "Content-Type: application/json" \
  -d '{"note":"Smoke test review","override_risk_level":"medium"}')
check "POST /scans/{id}/review as doctor" "201" "$REVIEW_CODE"
NOAUTH_REVIEW_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API/api/v1/scans/$SCAN_ID/review" \
  -H "Content-Type: application/json" -d '{"note":"should be rejected"}')
check "POST /scans/{id}/review with NO auth is rejected" "401" "$NOAUTH_REVIEW_CODE"

echo ""
echo "== Referrals =="
REFERRAL_JSON=$(curl -s -X POST "$API/api/v1/scans/$SCAN_ID/referral" -H "Content-Type: application/json" \
  -d '{"facility_name":"Community Eye Camp","notes":"Smoke test referral"}')
echo "$REFERRAL_JSON"
REFERRAL_ID=$(echo "$REFERRAL_JSON" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
[ -n "$REFERRAL_ID" ] && check "referral created" "1" "1" || check "referral created" "1" "0"
FACILITIES_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/v1/facilities")
check "GET /facilities" "200" "$FACILITIES_CODE"

echo ""
echo "== Admin: stats requires admin role =="
ADMIN_CODE=$(curl -s -o /tmp/admin.json -w "%{http_code}" "$API/api/v1/admin/stats" -H "Authorization: Bearer $TOKEN_ADMIN")
check "GET /admin/stats as admin" "200" "$ADMIN_CODE"
ADMIN_AS_DOCTOR_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/v1/admin/stats" -H "Authorization: Bearer $TOKEN_DOCTOR")
check "GET /admin/stats as doctor is rejected (403)" "403" "$ADMIN_AS_DOCTOR_CODE"

echo ""
echo "== Audit + Notifications exactly as useAuditLogs.ts / useNotifications.ts call them =="
AUDIT_JSON=$(curl -s "$API/api/v1/audit/logs?limit=5")
echo "$AUDIT_JSON" | python3 -m json.tool | head -12
NO_RESOURCE_FIELDS=$(echo "$AUDIT_JSON" | python3 -c "
import sys,json
rows=json.load(sys.stdin)
bad=any(('resource_type' in r or 'resource_id' in r) for r in rows)
print('0' if bad else '1')
")
check "audit rows have NO resource_type/resource_id (confirms the types/api.ts fix)" "1" "$NO_RESOURCE_FIELDS"

NOTIF_CODE=$(curl -s -o /tmp/notif.json -w "%{http_code}" "$API/api/v1/notifications?unread_only=false")
check "GET /notifications" "200" "$NOTIF_CODE"
cat /tmp/notif.json | python3 -m json.tool | head -20

echo ""
echo "================================"
echo "PASS=$PASS FAIL=$FAIL"
echo "================================"
