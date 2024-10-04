-- CreateTable
CREATE TABLE "ConversationContext" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "lastMessage" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationContext_phone_key" ON "ConversationContext"("phone");
