# AWS Deployment & Security Architecture

TaskFlow is designed to run on AWS using a standard, secure 3-tier setup. Nothing here
requires long-lived AWS access keys in production — everything uses IAM roles.

## Architecture

```
                          ┌─────────────────────┐
                          │   Route 53 (DNS)     │
                          └──────────┬───────────┘
                                     │
                          ┌──────────▼───────────┐
                          │  CloudFront (CDN)     │  ← serves the built React app
                          │  + ACM TLS cert        │     from an S3 static site bucket
                          └──────────┬───────────┘
                                     │
                          ┌──────────▼───────────┐
                          │  Application Load     │  ← public subnet, HTTPS only
                          │  Balancer (ALB)        │
                          └──────────┬───────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │   ECS Fargate Service (backend)  │  ← private subnet
                    │   - runs the Express + Socket.IO │
                    │     container                    │
                    │   - IAM Task Role (S3 access)    │
                    └───────┬───────────────┬──────────┘
                            │               │
                ┌───────────▼───┐   ┌───────▼────────────┐
                │  RDS Postgres  │   │  S3 (attachments)   │
                │  private subnet│   │  private, encrypted │
                │  encrypted     │   │  presigned URLs only│
                └────────────────┘   └─────────────────────┘

                Secrets (DB URL, JWT secrets) → AWS Secrets Manager
                                                 injected into ECS task at runtime
```

## Security principles applied

1. **No long-lived credentials in the app.** The ECS task assumes an IAM Role
   (`infra/aws/iam-policy.json`) scoped to *only* `PutObject` / `GetObject` / `DeleteObject`
   on the one attachments bucket — nothing else, no wildcard resources.

2. **Private-by-default S3.** "Block all public access" is enabled at the bucket level
   *and* enforced again via bucket policy (`infra/aws/s3-bucket-policy.json`). Files are
   only ever reachable through a presigned URL that expires in minutes
   (see `backend/src/controllers/attachment.controller.ts`).

3. **Encryption everywhere.** S3 uses SSE-S3 (AES256) by default; RDS has storage
   encryption enabled; traffic between the client and ALB is HTTPS only (TLS via ACM);
   the S3 bucket policy denies any request that isn't over `SecureTransport`.

4. **Network isolation.** RDS and the ECS tasks live in private subnets with no direct
   internet route — only the ALB is internet-facing. Security groups only allow the ALB
   to talk to ECS on the app port, and ECS to talk to RDS on 5432.

5. **Secrets Manager, not `.env` files, in production.** `DATABASE_URL`, `JWT_ACCESS_SECRET`,
   and `JWT_REFRESH_SECRET` are stored in AWS Secrets Manager and injected into the ECS
   task definition as `secrets`, not `environment` — they never appear in plaintext in
   the task definition or CloudWatch logs.

6. **Least-privilege file validation.** The backend whitelists MIME types and enforces a
   10MB size cap *before* issuing a presigned URL (`backend/src/config/s3.ts`), and every
   S3 key is server-generated with a random UUID — the client's filename is never trusted
   as a path, which blocks path-traversal / overwrite attacks.

## One-time setup

```bash
cd infra/aws
chmod +x setup-bucket.sh
./setup-bucket.sh          # creates + hardens the S3 bucket
```

Then in the AWS Console (or via Terraform/CDK if you prefer IaC):
1. Create an ECS Task Role, attach `iam-policy.json`.
2. Store secrets in Secrets Manager, reference them in the ECS task definition.
3. Deploy the backend container to ECS Fargate behind an ALB.
4. Build the frontend (`npm run build`) and upload `dist/` to a static S3 bucket served via CloudFront.
5. Point Route 53 at the CloudFront distribution and the ALB.

## Cost note
For a resume/portfolio project, RDS `db.t4g.micro` + Fargate (0.25 vCPU) + a tiny S3
bucket comfortably fits in the AWS Free Tier for the first 12 months.
