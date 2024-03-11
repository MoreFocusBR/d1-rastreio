import { NFE, NotaFiscal, NotaFiscalCreate, NotaFiscalGet, NotaFiscalRepository } from "../intefaces/nota-fiscal.interface";

class NotaFiscalRepositoryPrisma implements NotaFiscalRepository{
    get(data: NotaFiscalGet): Promise<NFE> {
        throw new Error("Method not implemented.");
    }
    create(data: NotaFiscalCreate): Promise<NotaFiscal> {
        throw new Error("Method not implemented.");
    }

}
export {NotaFiscalRepositoryPrisma};