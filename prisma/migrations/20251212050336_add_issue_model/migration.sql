-- CreateTable
CREATE TABLE "issues" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "feedbackRequestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'open',
    "severity" TEXT,
    "category" TEXT,
    "summary" TEXT,
    "details" TEXT,
    "ownerResponse" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "issues_feedbackRequestId_key" ON "issues"("feedbackRequestId");

-- CreateIndex
CREATE INDEX "issues_customerId_idx" ON "issues"("customerId");

-- CreateIndex
CREATE INDEX "issues_status_idx" ON "issues"("status");

-- CreateIndex
CREATE INDEX "issues_severity_idx" ON "issues"("severity");

-- CreateIndex
CREATE INDEX "issues_category_idx" ON "issues"("category");

-- CreateIndex
CREATE INDEX "issues_createdAt_idx" ON "issues"("createdAt");

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_feedbackRequestId_fkey" FOREIGN KEY ("feedbackRequestId") REFERENCES "feedback_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
