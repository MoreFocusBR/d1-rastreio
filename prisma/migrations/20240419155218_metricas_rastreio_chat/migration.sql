-- CreateTable
CREATE TABLE "RastreioChatMetricas" (
    "Id" TEXT NOT NULL,
    "Titulo" TEXT,
    "Etapa" INTEGER,
    "Cancelada" TEXT,
    "CodigoVenda" TEXT NOT NULL,
    "DataVenda" TEXT,
    "NotaFiscalEletronica" TEXT,
    "TransportadoraNome" TEXT,
    "momentoConsulta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Ocorrencias" TEXT,

    CONSTRAINT "RastreioChatMetricas_pkey" PRIMARY KEY ("Id")
);
