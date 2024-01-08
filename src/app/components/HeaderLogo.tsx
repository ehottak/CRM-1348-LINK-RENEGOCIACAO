import logo_qq from '../shared/queroqueroLogo.svg';
import Image from "next/image";
function HeaderLogoComponente() {
    return (
        <>
        <div className="mt-8 left-0 right-0 border-2 flex items-center bg-yellow-400">
            <div className="m-auto h-10 flex items-center">
                <Image src={logo_qq} alt="Logo QQ" width={230} className="object-cover" />
            </div>
        </div>
        </>
    );
}

export default HeaderLogoComponente;
