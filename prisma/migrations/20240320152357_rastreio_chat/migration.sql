-- CreateTable
CREATE TABLE "RastreioChat" (
    "Id" TEXT NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Etapa" INTEGER NOT NULL,
    "Prioridade" INTEGER NOT NULL,
    "Mensagem" TEXT NOT NULL,
    "Ativo" BOOLEAN NOT NULL,

    CONSTRAINT "RastreioChat_pkey" PRIMARY KEY ("Id")
);
