import loading from '@/app/shared/loading.svg';
import Image from "next/image";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Image
                className="animate-spin relative"
                src={loading}
                width={80}
                alt="loading"
            />
        </div>
       )
}
