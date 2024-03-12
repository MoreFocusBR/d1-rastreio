import { NotaFiscal, NFE, NotaFiscalGet, NotaFiscalCreate, NotaFiscalRepository } from "../intefaces/nota-fiscal.interface";
import { NotaFiscalRepositoryPrisma } from "../repositories/nf.repository";
class NfeUseCase {
    private notaFiscalRepository : NotaFiscalRepository;
    constructor(){
        this.notaFiscalRepository = new NotaFiscalRepositoryPrisma()
    }

    async create({codigo, codigoVenda }: NotaFiscalCreate): Promise<NotaFiscal>{
        const result = await this.notaFiscalRepository.create({codigo, codigoVenda});
        return result;
    }

    async get({codigoVenda }: NotaFiscalGet): Promise<NFE>{
        const result = await this.notaFiscalRepository.get({codigoVenda});
        return result;
    }
}   
export {NfeUseCase};