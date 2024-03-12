import { Prisma } from "@prisma/client";

import { NFE, NotaFiscal, NotaFiscalCreate, NotaFiscalGet, NotaFiscalRepository } from "../intefaces/nota-fiscal.interface";

class NotaFiscalRepositoryPrisma implements NotaFiscalRepository{
    get(data: NotaFiscalGet): Promise<NFE> {
        throw new Error("Method not implemented.");
    }
    async create(data: NotaFiscalCreate): Promise<NotaFiscal> {
        //const data = await this.
        throw new Error("Method not implemented.");
    }

}
export {NotaFiscalRepositoryPrisma};