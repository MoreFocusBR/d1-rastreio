-- CreateTable
CREATE TABLE "AdminUsers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "AdminUsers_pkey" PRIMARY KEY ("id")
);
