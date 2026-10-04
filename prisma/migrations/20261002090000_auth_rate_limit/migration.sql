CREATE TABLE "SecurityRateLimit" (
  "key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SecurityRateLimit_pkey" PRIMARY KEY ("key")
);
CREATE INDEX "SecurityRateLimit_expires_idx" ON "SecurityRateLimit"("expires");
