"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const venda_repository_1 = require("../repositories/venda.repository");
class VendaUseCase {
    constructor() {
        this.vendaRepository = new venda_repository_1.VendaRepositoryPrisma();
    }
}
