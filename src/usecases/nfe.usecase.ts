import { NotaFiscal, NotaFiscalCreate, NotaFiscalRepository } from "../intefaces/nota-fiscal.interface";
import { NotaFiscalRepositoryPrisma } from "../repositories/nf.repository";
class NfeUseCase {
    private notaFiscalRepository : NotaFiscalRepository;
    constructor(){
        this.notaFiscalRepository = new NotaFiscalRepositoryPrisma()
    }

    async create({codigo, codigoVenda }: NotaFiscalCreate): Promise<NotaFiscal>{

    }

}   
export {NfeUseCase};