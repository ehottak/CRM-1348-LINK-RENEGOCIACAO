import {NextResponse} from "next/server";
import axios from "axios";
import { prisma } from '@/app/lib/prisma';
import {SituacaoSeguroEnum} from "@/app/lib/SituacaoSeguroEnum";
// import { SituacaoSeguroEnum } from '@prisma/client'

export async function POST(request: Request) {

    const isBiometriaValida = (response: any): boolean => {
        return response.data.statusCode === 200 && response.data.result?.Id != null;
    }

    const isBiometriaProcessValida = (response: any): boolean =>{
        return response.data.statusCode === 200 && response.data.result?.Score >= 10 && response.data.result?.Liveness !== 2;
    }
    let data = await request.json();
    let dataContrato = null;
    const fotoBase64 = data.base64;
    const parametroUrl = data.parametro;
    const idRelContrato = data.idRelContrato
    const response = await axios.get(`${process.env.NEXT_URL}seguro-residencial/api/consulta-contrato?parametro_url=${parametroUrl}`);
    if (response.status >= 200 && response.status < 300) {
        dataContrato = response.data;
    } else {
        return NextResponse.json({ message: 'Erro ao consultar contrato' }, { status: 400 });
    }
    const username = process.env.APP_NAME || '';
    const password = process.env.BIFROST_TOKEN || '';

    const config = {
        auth: { username, password },
    };
    try {
          const response = await axios.post(`${process.env.APP_API_UNICO}processes`, {
            key_secret_api_unico: process.env.APP_KEY_SECRET,
            subject: { Code: dataContrato.cpfConsumidor, Name: dataContrato.nomeCompleto },
            reqNrCic: dataContrato.cpfConsumidor,
            onlySelfie: true,
            imagebase64: fotoBase64
        });
        process.stdout.write(JSON.stringify(response.data));
        if(response.data.statusCode === 400) {
            return NextResponse.json({message:response.data.result.error.Description}, {status: 503});
        }
        if (isBiometriaValida(response)) {
            process.stdout.write('Biometria enviada com sucesso ID:' + response.data.result.Id);
            const responseBioProcess = await biometriaProcess(response.data.result.Id, parametroUrl)
            await setRequisicao(parametroUrl,1,false,SituacaoSeguroEnum.PENDENTE);
            if (isBiometriaProcessValida(responseBioProcess)) {
                process.stdout.write('Biometria processada com sucesso ID:' + responseBioProcess?.data.result.Id);
                const confirmaContrato = await axios.post(`${process.env.APP_API_BIFROST}confirmaContratoSeguro?idRelContrato=${idRelContrato}&situacao=APROVADO`,{},config)
                if (confirmaContrato.data.success) {
                    await setRequisicao(parametroUrl, 0, true, SituacaoSeguroEnum.CONCLUIDO);
                    return NextResponse.json({message: 'Contrato aprovado com sucesso'}, {status: 200});
                }
            }else{
                await setRequisicao(parametroUrl, 0, true, SituacaoSeguroEnum.ERRO_BIOMETRIA);
                 process.stdout.write('Biometria isBiometriaProcessValida Não Valida')
                await axios.post(`${process.env.APP_API_BIFROST}confirmaContratoSeguro?idRelContrato=${idRelContrato}&situacao=ERRO BIOMETRIA`,{},config)
                return NextResponse.json({message:'Biometria Invalida'}, {status: 400});
            }
        }
        await setRequisicao(parametroUrl, 0, true, SituacaoSeguroEnum.ERRO_BIOMETRIA);
        await axios.post(`${process.env.APP_API_BIFROST}confirmaContratoSeguro?idRelContrato=${idRelContrato}&situacao=ERRO BIOMETRIA`,{},config)
         process.stdout.write('Biometria Não Valida')
        return NextResponse.json({message:'Biometria Não Valida'}, {status: 400});
    } catch (e) {
        await axios.post(`${process.env.APP_API_BIFROST}confirmaContratoSeguro?idRelContrato=${idRelContrato}&situacao=ERRO`,{},config)
        return NextResponse.json({message:e}, {status: 400});
    }

}

const biometriaProcess = async (idProcess: string, parametroUrl: string) => {
    try {
         process.stdout.write('INICIANDO BIOMETRIA PROCESS, PARAMETROURL: ' + parametroUrl);
        let retornoBio = null;
        for (let i = 0; i < 5; i++) {
            retornoBio = await axios.post(`${process.env.APP_API_UNICO}getprocess`, {
                key_secret_api_unico: process.env.APP_KEY_SECRET,
                process_id: idProcess
            })
            if (retornoBio.data.result.Status >= 3) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        return retornoBio ? retornoBio : null
    } catch (e) {
         process.stdout.write('ERRO BIOMETRIA PROCESS, PARAMETROURL' + parametroUrl + '\n Erro:' + e);
        return null;
    }
}

const setRequisicao = async (parametroUrl: string, decrement: number, zerar: boolean,situacao: SituacaoSeguroEnum) => {
    try {

        if (zerar) {
            const result = await prisma.contratoSeguro.update({
                where: {
                    parametro_url: parametroUrl,
                },
                data: {
                    qntreq: 0,
                    situacao: situacao,
                },
            });
        } else {
            const result = await prisma.contratoSeguro.update({
                where: {
                    parametro_url: parametroUrl,
                },
                data: {

                    qntreq: {
                        decrement: decrement,
                    },
                    situacao: situacao,
                },
            });
        }
    } catch (e) {
         process.stdout.write('ERRO SET REQUISICAO, PARAMETROURL' + parametroUrl + '\n Erro:' + e);
    }
}
