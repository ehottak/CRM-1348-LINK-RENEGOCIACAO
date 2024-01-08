import React from 'react';
interface TituloComponenteProps {
    title: string;
}
function TituloComponente(props : TituloComponenteProps) {
    return (

        <div className="mt-8 mx-4">
            <p className="text-white font-semibold">
                    {props.title}
            </p>
            <hr className="mt-2"/>
        </div>
    );
}

export default TituloComponente;
