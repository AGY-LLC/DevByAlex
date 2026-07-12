---
id: stack-aws
title: "AWS"
summary: "I use AWS for things that Vercel or Railway can't easily do: background workers, managed databases (RDS), file storage (S3), queues (SQS), and when I need full infrastructure control."
tags: ["stack", "aws"]
updated: 2026-05-28
---
# AWS

I use AWS for things that Vercel or Railway can't easily do: background workers, managed databases (RDS), file storage (S3), queues (SQS), and when I need full infrastructure control.

I'm not an AWS specialist. I know enough to ship things and enough to avoid obvious mistakes. When infra gets complex, I document decisions carefully.

---

## Services I've Used

### S3
File storage. The default choice for any user-uploaded content. Cheap, reliable, integrates with everything.

Key things to know:
- Bucket policies and IAM permissions are where bugs live
- Presigned URLs for client-side uploads: never route file bytes through your API server
- CloudFront in front of S3 if you're serving assets at any volume
- Block public access by default; grant access explicitly

### SQS
Queue-based async processing. If you have work that doesn't need to be synchronous (email sending, webhook fanout, report generation), SQS decouples it cleanly. I would say mostly unnecessary until you have lots of users.

### Lambda
Serverless functions. I use these less than you might expect: the Vercel serverless story is better DX for Next.js. Lambda makes sense for: event-driven processing, S3 triggers, scheduled tasks where you don't want a running server.

### IAM
Roles and permissions. The most important thing to get right and the easiest to misconfigure.

Key things to know:
- Least privilege: give services only the permissions they need
- Use roles, not long-lived access keys where possible
- Audit IAM permissions before going to production

---

## Rules

- Never hardcode AWS credentials in code. Use IAM roles in production, env vars in dev.
- S3 bucket access must be explicitly granted: block public access by default.
- Enable CloudTrail for audit logging on production accounts.

## Preferences

- CloudFront in front of S3 for any user-facing assets
