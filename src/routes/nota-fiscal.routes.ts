import { FastifyInstance } from "fastify";
import { NfeUseCase } from "../usecases/nfe.usecase";
import { NotaFiscal, NotaFiscalCreate } from "../intefaces/nota-fiscal.interface";

export function notaFiscalRoutes(fastify: FastifyInstance){
    const nfeUseCase = new NfeUseCase();
    fastify.post< {Body: NotaFiscalCreate} >('/', (req, reply)=>{
        const {codigo, codigoVenda} = req.body

        try {
            const data  = nfeUseCase.create({
                codigo,
                codigoVenda,
            });
            return reply.send(data);
        } catch (error) {
            reply.send(error)
        }  
    })
}