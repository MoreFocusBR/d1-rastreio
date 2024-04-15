-- CreateTable
CREATE TABLE "contextoRastreio" (
    "Id" TEXT NOT NULL,
    "Telefone" TEXT NOT NULL,
    "Etapa" INTEGER NOT NULL,
    "Data" TEXT NOT NULL,

    CONSTRAINT "contextoRastreio_pkey" PRIMARY KEY ("Id")
);
