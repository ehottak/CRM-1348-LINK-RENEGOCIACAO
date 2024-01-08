import React, {useState} from 'react';

interface BotaoComponenteProps {
    enable: boolean;
    title: string;
}

function BotaoComponente(props: BotaoComponenteProps) {
    if(!props.enable){
        return null;
    }
    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
            <button
                className="bg-yellow-400 font-bold text-green-700 py-3 px-20 rounded-md mb-4"
                disabled={!props.enable}
                type="button"
            >
                {props.title}
            </button>
        </div>
    );
}

export default BotaoComponente;
