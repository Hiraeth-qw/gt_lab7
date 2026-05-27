import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import { useMapglContext } from './MapglContext';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import geoData from './data/data.json';

export const MAP_CENTER = [44.516939, 48.708144];

type MapglAPI = Awaited<ReturnType<typeof load>>;

export default function Mapgl() {
    const { setMapglContext } = useMapglContext();

    useEffect(() => {
        let map: InstanceType<MapglAPI['Map']> | undefined = undefined;

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 11,
                key: '08310540-a877-4e28-9c96-4849a6a9bb17',
                style: '148e3276-6307-414e-9343-8eacb69c8360',
            });

            map.on('styleload', () => {
                if (!map) return;

                const data: FeatureCollection<Geometry, GeoJsonProperties> =
                    geoData as FeatureCollection<Geometry, GeoJsonProperties>;

                new mapgl.GeoJsonSource(map, {
                    data,
                    attributes: {
                        visible: true,
                    },
                });

                const pointsLayer: any = {
                    id: 'dtp-points',
                    type: 'point',
                    filter: ['all', ['match', ['sourceAttr', 'visible'], [true], true, false]],
                    style: {
                        iconImage: 'caution',
                        iconWidth: 15,
                        textField: ['get', 'category'],
                        textFont: ['Noto_Sans'],
                        textColor: '#000000',
                        textHaloColor: '#fff',
                        textHaloWidth: 1,
                        iconPriority: 100,
                        textPriority: 100,
                    },
                };

                map.addLayer(pointsLayer);
            });

            map.on('click', (e: any) => {
                console.log(e);
            });
            setMapglContext({
                mapglInstance: map,

                mapgl,
            });
        });

        return () => {
            map?.destroy();

            setMapglContext({
                mapglInstance: undefined,

                mapgl: undefined,
            });
        };
    }, [setMapglContext]);

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
