-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "staffName" TEXT,
    "appointmentTime" TIMESTAMP(3) NOT NULL,
    "checkoutTime" TIMESTAMP(3),
    "priceCharged" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_requests" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "respondedAt" TIMESTAMP(3),
    "reviewLinkClicked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "feedback_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winback_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minDaysSinceLastVisit" INTEGER NOT NULL,
    "maxDaysSinceLastVisit" INTEGER NOT NULL,
    "messageTemplate" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "winback_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "winback_messages" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "responseType" TEXT,

    CONSTRAINT "winback_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "visits_customerId_idx" ON "visits"("customerId");

-- CreateIndex
CREATE INDEX "visits_serviceId_idx" ON "visits"("serviceId");

-- CreateIndex
CREATE INDEX "visits_appointmentTime_idx" ON "visits"("appointmentTime");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_requests_visitId_key" ON "feedback_requests"("visitId");

-- CreateIndex
CREATE INDEX "feedback_requests_visitId_idx" ON "feedback_requests"("visitId");

-- CreateIndex
CREATE INDEX "feedback_requests_status_idx" ON "feedback_requests"("status");

-- CreateIndex
CREATE INDEX "winback_messages_campaignId_idx" ON "winback_messages"("campaignId");

-- CreateIndex
CREATE INDEX "winback_messages_customerId_idx" ON "winback_messages"("customerId");

-- CreateIndex
CREATE INDEX "winback_messages_status_idx" ON "winback_messages"("status");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_requests" ADD CONSTRAINT "feedback_requests_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winback_messages" ADD CONSTRAINT "winback_messages_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "winback_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "winback_messages" ADD CONSTRAINT "winback_messages_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
