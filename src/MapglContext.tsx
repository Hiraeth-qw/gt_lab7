import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { RulerControl } from '@2gis/mapgl-ruler';
import { load } from '@2gis/mapgl';

type MapglAPI = Awaited<ReturnType<typeof load>>;
type MapInstance = InstanceType<MapglAPI['Map']>;

const MapglContext = createContext<{
    mapgl?: typeof mapgl;
    mapglInstance?: MapInstance;
    rulerControl?: RulerControl;
    setMapglContext: Dispatch<SetStateAction<MapContextState>>;
}>({
    mapgl: undefined,
    mapglInstance: undefined,
    rulerControl: undefined,
    setMapglContext: () => {},
});

interface MapContextState {
    mapglInstance?: MapInstance;
    mapgl?: typeof mapgl;
    rulerControl?: RulerControl;
}

export function useMapglContext() {
    return useContext(MapglContext);
}

export function MapglContextProvider({ children }: { children: ReactNode }) {
    const [{ mapglInstance, rulerControl, mapgl }, setMapglContext] = useState<MapContextState>({
        mapglInstance: undefined,
        rulerControl: undefined,
        mapgl: undefined,
    });
    return (
        <MapglContext.Provider value={{ mapgl, mapglInstance, rulerControl, setMapglContext }}>
            {children}
        </MapglContext.Provider>
    );
}
