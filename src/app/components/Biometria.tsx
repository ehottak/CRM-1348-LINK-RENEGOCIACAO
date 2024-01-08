'use client'
import React, {useEffect, useRef, useState} from "react";
import Image from "next/image";
import deleteImage from '@/app/shared/delete.svg'
import AddPhoto from '@/app/shared/photo.svg'
import doneImage from '@/app/shared/done.svg'
import {useSearchParams,useRouter} from "next/navigation";
import Loading from "@/app/loading";
import selfie from "../shared/images/selfie.png";
import {contratoInformacoes} from "@/app/types/contratoType";

export default function BiometriaComponente() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [windowSize, setWindowSize] = useState({width: 0, height: 0});
    const [isLoading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    let canvas = null;
    let buttonCheck = true;
    let deletePhoto: boolean;
    let checkButton: boolean;
    const searchParams = useSearchParams()
    const parametro = searchParams.get('parametroUrl')
    const [dataContrato, setDataContrato] = useState<contratoInformacoes | null>(null);
    const fetchData = async () => {
        try {
            const response = await fetch(`/seguro-residencial/api/consulta-contrato?parametro_url=${parametro}`);
            const data = await response.json();
            setDataContrato(data);
            if (!response.ok) {
                router.push('/not-found');
            }
        } catch (error) {
            router.push('/not-found');
        }
    };
    useEffect(() => {
        const fetchDataAndSetLoading = async () => {
            await fetchData();
        };
        fetchDataAndSetLoading().then(() => {
            setLoading(false)
        });
    }, []);

    useEffect(() => {
        function handleResize() {
            setWindowSize({width: window.innerWidth, height: window.innerHeight});
        }
        handleResize(); // Inicializar o tamanho da janela

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        let streaming = false;

        function start() {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const constraints = {video: true, audio: false};
                    navigator.mediaDevices.getUserMedia(constraints)
                        .then(function (stream) {
                            if (video) {
                                if ("srcObject" in video) {
                                    video.srcObject = stream;
                                }
                                if ("play" in video) {
                                    video.play();
                                }
                            }
                        })
                        .catch(function (err) {
                            console.log('An error occurred while accessing the camera: ' + err);
                        });
                } catch (err) {
                    console.log('An error occurred while accessing the camera: ' + err);
                }
            } else {
                console.log('getUserMedia() is not supported by your browser')
            }
            if (video && canvas) {
                video.addEventListener('loadedmetadata', function () {
                    if (!streaming) {
                        const videoWidth = video.videoWidth;
                        const videoHeight = video.videoHeight
                        const aspectRatio = videoWidth / videoHeight;

                        // Calcular as dimensões do vídeo com base na proporção atual da janela
                        const windowAspectRatio = windowSize.width / windowSize.height;

                        let newWidth, newHeight;
                        if (aspectRatio > windowAspectRatio) {
                            newWidth = windowSize.width ;
                            newHeight = windowSize.width / aspectRatio;
                        } else {
                            newWidth = (windowSize.height * aspectRatio)  ;
                            newHeight = windowSize.height ;
                        }

                        video.setAttribute('width', newWidth.toString());
                        video.setAttribute('height', newHeight.toString());

                        canvas.setAttribute('width', newWidth.toString());
                        canvas.setAttribute('height', newHeight.toString());
                        streaming = true;
                    }
                })
            }
        }

        start();

    }, [windowSize,isLoading]);

    function capturePhoto() {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas) {
            // Defina a largura e altura do canvas para o mesmo tamanho do vídeo
            const width = video.videoWidth;
            const height = video.videoHeight;
            canvas.width = width;
            canvas.height = height;

            // Desenhe a imagem do vídeo no canvas
            const context = canvas.getContext('2d');
            if(context)
            context.drawImage(video, 0, 0, width, height);
        }
    }

   const startClick = () => {
        console.log(buttonCheck)
        if (buttonCheck) {
            capturePhoto();
            deletePhoto = true;
            buttonCheck = false;
        }
    }

    const deleteClick = () =>{
        if(deletePhoto) {
            clearphoto();
            buttonCheck = true;
        }
    }

    const clearphoto= () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if(canvas && video){
            const context = canvas.getContext('2d');
            if(context)
            context.clearRect(0, 0, video.videoWidth , video.videoHeight);
            const data = canvas.toDataURL('image/jpeg');
            canvas.setAttribute('src', data);
        }
    }
    const envioFotocheck = async () => {
        const canvas = canvasRef.current;
        if (!buttonCheck && canvas) {
            checkButton = false
            const data = canvas.toDataURL('image/jpeg');
            if (data !== null && parametro !== null) {
                const idRelContrato = dataContrato?.idRelContrato;
                await envioFoto(parametro, data,idRelContrato)
            } else {
                checkButton = true
                alert('Tirar foto novamente')
            }
        } else {
            alert('Por favor tirar foto antes de enviar')
        }
    }

    const envioFoto = async (parametro: string, base64: string, idRelContrato: number | undefined) => {
        setLoading(true)
        const response = await fetch('/seguro-residencial/api/biometria', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({parametro, base64, idRelContrato})
        })
        const data = await response.json();
        console.log('data Biometria', data)
        if(response.ok){
            router.push('/sucesso');
        }
        if(response.status === 503) {
            deleteClick();
            alert(data.message);
        }

        router.push('/error')


    }


    if (isLoading) {
        return <Loading />;
    }
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative mt-5 mx-5">
                <video ref={videoRef} id="video" className="rounded-xl bg-white border-4 border-yellow-400 w-full" style={{ transform: "scaleX(-1)" }}/>
                <Image
                    src={selfie}
                    alt="Imagem"
                    className="absolute inset-0 w-full h-full"
                />
                <canvas
                    ref={canvasRef}
                    id="canvas"
                    className="absolute inset-0 rounded-xl border-4 border-yellow-400 w-full"
                    style={{ transform: "scaleX(-1)" }}
                />
            </div>
            <div className="inline-flex items-center mx-10 mt-10">
                <button className="px-5 py-2 rounded-full border border-yellow-400 bg-green-600 drop-shadow-2xl mr-10"
                        id="deletePhoto"
                        onClick={deleteClick}
                        >
                    <Image src={deleteImage} alt="Deletar"/>
                </button>
                <button className="px-5 py-2 rounded-full border border-yellow-400 bg-green-600 drop-shadow-2xl mr-10"
                        id="startButton"
                        onClick={startClick}>
                    <Image src={AddPhoto} alt="Tirar"/>
                </button>
                <button className="px-5 py-2 rounded-full border border-yellow-400 bg-green-600 drop-shadow-2xl"
                        id="checkButton"
                        onClick={envioFotocheck}>
                    <Image src={doneImage} alt="Enviar"/>
                </button>
            </div>

        </div>
    );

};
