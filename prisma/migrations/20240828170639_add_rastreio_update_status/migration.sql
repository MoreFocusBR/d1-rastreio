-- CreateTable
CREATE TABLE "RastreioUpdateStatus" (
    "Id" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    "CodigoVenda" TEXT NOT NULL,
    "MomentoConsulta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RastreioUpdateStatus_pkey" PRIMARY KEY ("Id")
);
