import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import geoData from './data/data.json';

export const MAP_CENTER: [number, number] = [44.516939, 48.708144];

type GeoFeature = {
    geometry: {
        coordinates: number[];
    };
    properties: {
        severity: string;
        category: string;
    };
};

export default function Mapgl() {
    useEffect(() => {
        let map: any = null;

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 11,
                key: '08310540-a877-4e28-9c96-4849a6a9bb17',
                style: '148e3276-6307-414e-9343-8eacb69c8360',
            });

            map.on('styleload', () => {
                if (!map) return;

                const features = geoData.features as GeoFeature[];

                features.forEach((feature) => {
                    const coords = feature.geometry.coordinates;

                    new mapgl.Circle(map, {
                        coordinates: coords,
                        radius: 8,
                        color: '#eeff00',
                        strokeWidth: 2,
                        strokeColor: '#ffffff',
                    });
                });

                new mapgl.GeoJsonSource(map, {
                    data: geoData as any,
                    attributes: {
                        source: 'dtp',
                    },
                });

                const labelsLayer: any = {
                    id: 'dtp-labels',
                    type: 'point',
                    minzoom: 15,
                    filter: ['all', ['match', ['sourceAttr', 'source'], ['dtp'], true, false]],
                    style: {
                        textField: ['get', 'category'],
                        textFont: ['Noto_Sans'],
                        textFontSize: 15,
                        textColor: '#ffffff',
                        textHaloColor: '#000000',
                        textHaloWidth: 2,
                        textPlacement: 'topCenter',
                        textOffset: 8,
                        textAllowOverlap: false,
                        textIgnorePlacement: false,
                        textPriority: 1000,
                    },
                };

                map.addLayer(labelsLayer);
            });
        });

        return () => {
            if (map) {
                map.destroy();
            }
        };
    }, []);

    return (
        <div
            id='map-container'
            style={{
                width: '100%',
                height: '100vh',
            }}
        />
    );
}
