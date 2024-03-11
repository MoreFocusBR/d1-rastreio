import { VendaRepositoryPrisma } from "../repositories/venda.repository";
class VendaUseCase {
    private vendaRepository
    constructor(){
        this.vendaRepository = new VendaRepositoryPrisma()
    }

}   