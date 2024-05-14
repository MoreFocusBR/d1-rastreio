-- CreateTable
CREATE TABLE "RastreioStatusWhats" (
    "Id" TEXT NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Mensagem" TEXT NOT NULL,
    "Ativo" BOOLEAN NOT NULL,

    CONSTRAINT "RastreioStatusWhats_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "RastreioStatusEmail" (
    "Id" TEXT NOT NULL,
    "Titulo" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "Mensagem" TEXT NOT NULL,
    "Ativo" BOOLEAN NOT NULL,

    CONSTRAINT "RastreioStatusEmail_pkey" PRIMARY KEY ("Id")
);
