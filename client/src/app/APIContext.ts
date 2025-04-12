'use client'
import { createContext } from 'react';
import { SuperSantaAPI } from 'super-santa-sdk/dist/index.js';
import { useState } from 'react';

export interface APIContextProps {
    api: SuperSantaAPI;
}
export const initAPIContext : () => APIContextProps = () => {
    const [api, setAPI] = useState<SuperSantaAPI>(SuperSantaAPI.getInstance({apiHost : "http://localhost:8080"}));
    return {api : api};
}

export const APIContext = createContext<APIContextProps | null>(null);
