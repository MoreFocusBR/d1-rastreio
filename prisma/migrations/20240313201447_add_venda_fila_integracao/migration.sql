-- CreateTable
CREATE TABLE "VendaFilaIntegracao" (
    "Id" TEXT NOT NULL,
    "Codigo" INTEGER NOT NULL,
    "ClienteDocumento" TEXT NOT NULL,
    "Payload" TEXT NOT NULL,

    CONSTRAINT "VendaFilaIntegracao_pkey" PRIMARY KEY ("Id")
);
