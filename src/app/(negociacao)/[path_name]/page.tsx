import React from 'react';
import HeaderLogo from "@/app/components/HeaderLogo";
import Titulo from "@/app/components/Titulo";
import Botao from "@/app/components/Botao";
import Link from "next/link";

export default function Home() {
    return (<>
            <HeaderLogo/>
            <Titulo title='Dados Do Cliente'/>
            <div className="mt-1 flex">
                <div className="mx-4">
                    <p className="mt-2">Nome:</p>
                    <p className="mt-2">Data de nascimento:</p>
                    <p className="mt-2">CPF:</p>
                    <p className="mt-2">Nacionalidade:</p>
                    <p className="mt-2">Estado Civil:</p>
                    <p className="mt-2">Nome da Mãe:</p>
                    <p className="mt-2">Data Base:</p>

                    <p className="mt-5">Endeço:</p>
                </div>
            </div>
            <Titulo title='Referencia Pessoal'/>
            <div className="mt-1 mx-4 flex">
                <p className="mt-2">Nome:</p>
            </div>
            <Titulo title='Dados Profissionais'/>
            <div className="mt-1 flex">
                <div className="mx-4">
                    <p className="mt-2">Categoria:</p>
                    <p className="mt-2">cargo:</p>
                    <p className="mt-2">Empresa:</p>
                    <p className="mt-2">Renda:</p>
                </div>
            </div>
            <Link href={{
                pathname: "/confissao-divida",
                query: {parametroUrl: 'parametro'},
            }}>
                <Botao title="PROXIMO" enable={true}/>
            </Link>

        </>
    );
}
