"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notaFiscalRoutes = void 0;
const nfe_usecase_1 = require("../usecases/nfe.usecase");
async function notaFiscalRoutes(fastify) {
    const nfeUseCase = new nfe_usecase_1.NfeUseCase();
    fastify.post('/', (req, reply) => {
        const { codigo, codigoVenda } = req.body;
        try {
            const data = nfeUseCase.create({
                codigo,
                codigoVenda,
            });
            return reply.send(data);
        }
        catch (error) {
            reply.send(error);
        }
    });
    fastify.get('/', (req, reply) => {
        const { codigoVenda } = req.body;
        try {
            const data = nfeUseCase.get({
                codigoVenda,
            });
            return reply.send(data);
        }
        catch (error) {
            reply.send(error);
        }
    });
}
exports.notaFiscalRoutes = notaFiscalRoutes;
