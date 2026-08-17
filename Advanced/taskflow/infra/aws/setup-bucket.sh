#!/bin/bash
# One-time setup for the TaskFlow attachments bucket.
# Run this once with an admin/deploy AWS profile: `aws configure --profile taskflow-deploy`
set -e

BUCKET="taskflow-attachments-prod"
REGION="ap-south-1"

echo "Creating private S3 bucket: $BUCKET"
aws s3api create-bucket \
  --bucket "$BUCKET" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION"

echo "Blocking ALL public access (defense in depth)"
aws s3api put-public-access-block \
  --bucket "$BUCKET" \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

echo "Enabling default server-side encryption (AES256)"
aws s3api put-bucket-encryption \
  --bucket "$BUCKET" \
  --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

echo "Enabling versioning (protects against accidental overwrite/delete)"
aws s3api put-bucket-versioning \
  --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

echo "Applying CORS policy (only our app origins can upload)"
aws s3api put-bucket-cors \
  --bucket "$BUCKET" \
  --cors-configuration file://s3-cors.json

echo "Applying bucket policy (deny access from outside our account)"
aws s3api put-bucket-policy \
  --bucket "$BUCKET" \
  --policy file://s3-bucket-policy.json

echo "Setting a lifecycle rule to auto-delete files older than 365 days from a 'tmp/' prefix (optional cleanup)"
aws s3api put-bucket-lifecycle-configuration \
  --bucket "$BUCKET" \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "ExpireTempUploads",
      "Filter": {"Prefix": "tmp/"},
      "Status": "Enabled",
      "Expiration": {"Days": 365}
    }]
  }'

echo "Done. Bucket '$BUCKET' is private, encrypted, versioned, and locked to app origins."
echo "Next: attach infra/aws/iam-policy.json to the ECS task role (not to a static IAM user)."
