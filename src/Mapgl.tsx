import { useEffect, useRef, useState } from 'react';
import { load } from '@2gis/mapgl';
import { Directions } from '@2gis/mapgl-directions';
import { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import geoData from './data/data.json';

export const MAP_CENTER: [number, number] = [44.516939, 48.708144];

const touristPoints = [
    { name: 'Привокзальная площадь', coordinates: [44.514397, 48.712162] },
    { name: 'Площадь Павших Борцов', coordinates: [44.515628, 48.707965] },
    { name: 'Аллея Героев', coordinates: [44.518648, 48.70588] },
    { name: 'Набережная 62-й Армии', coordinates: [44.535642, 48.714748] },
    { name: 'Музей-панорама «Сталинградская битва»', coordinates: [44.5331, 48.71469] },
];

type MapglAPI = Awaited<ReturnType<typeof load>>;

const pointsLayer: any = {
    id: 'dtp-points',
    type: 'point',
    filter: ['all', ['match', ['sourceAttr', 'visible'], [true], true, false]],
    style: {
        iconImage: 'caution',
        iconWidth: 20,
        textField: ['get', 'category'],
        textFont: ['Noto_Sans'],
        textColor: '#000000',
        textHaloColor: '#fff',
        textHaloWidth: 1,
        iconPriority: 100,
        textPriority: 100,
    },
};

const heatmapLayer: any = {
    id: 'dtp-heatmap-layer',
    type: 'heatmap',
    filter: ['match', ['sourceAttr', 'visible'], [true], true, false],
    style: {
        color: [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0,0,0,0)',
            0.2,
            'rgba(0,102,255,0.6)',
            0.4,
            'rgba(0,204,255,0.7)',
            0.6,
            'rgba(255,255,0,0.8)',
            0.8,
            'rgba(255,128,0,0.9)',
            1,
            'rgba(255,0,0,1)',
        ],
        radius: 25,
        intensity: 1,
        opacity: 0.8,
        downscale: 1,
    },
};

export default function CombinedMap() {
    const mapRef = useRef<any>(null);
    const directionsRef = useRef<any>(null);

    const sourceRef = useRef<any>(null);
    const activeLayersRef = useRef<Set<string>>(new Set());

    const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');
    const [routeVisible, setRouteVisible] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);

    const safeAddLayer = (map: any, layer: any) => {
        if (!map || !layer || typeof layer !== 'object') return; // Защита от строк

        if (!activeLayersRef.current.has(layer.id) && sourceRef.current) {
            layer.source = sourceRef.current;
            map.addLayer(layer);
            activeLayersRef.current.add(layer.id);
        }
    };

    const safeRemoveLayer = (map: any, layer: any) => {
        if (!map || !layer) return;

        const layerId = typeof layer === 'string' ? layer : layer.id;

        if (activeLayersRef.current.has(layerId)) {
            map.removeLayer(layerId);
            activeLayersRef.current.delete(layerId);
        }
    };

    useEffect(() => {
        let mapInstance: InstanceType<MapglAPI['Map']> | undefined = undefined;

        load().then((mapgl) => {
            mapInstance = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 12,
                key: '08310540-a877-4e28-9c96-4849a6a9bb17',
                style: '148e3276-6307-414e-9343-8eacb69c8360',
            });

            mapRef.current = mapInstance;

            mapInstance.on('styleload', () => {
                if (!mapInstance) return;

                const data = geoData as FeatureCollection<Geometry, GeoJsonProperties>;

                sourceRef.current = new mapgl.GeoJsonSource(mapInstance, {
                    data,
                    attributes: { visible: true },
                });

                directionsRef.current = new Directions(mapInstance, {
                    directionsApiKey: '08310540-a877-4e28-9c96-4849a6a9bb17',
                });

                safeAddLayer(mapInstance, pointsLayer);
                setMapLoaded(true);
            });
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.destroy();
            }
            activeLayersRef.current.clear();
            sourceRef.current = null;
        };
    }, []);

    // 2. Переключение режимов отображения
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapLoaded) return;

        if (viewMode === 'markers') {
            safeRemoveLayer(map, heatmapLayer);
            clearRoute();
            safeAddLayer(map, pointsLayer);
        } else if (viewMode === 'heatmap') {
            safeRemoveLayer(map, pointsLayer);
            safeAddLayer(map, heatmapLayer);
        }
    }, [viewMode, mapLoaded]);

    const buildRoute = async () => {
        if (!directionsRef.current) return;
        await directionsRef.current.pedestrianRoute({
            points: touristPoints.map((p) => p.coordinates),
        });
        setRouteVisible(true);
    };

    const clearRoute = () => {
        if (!directionsRef.current) return;
        directionsRef.current.clear();
        setRouteVisible(false);
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <div
                style={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    background: 'white',
                    padding: '6px',
                    borderRadius: '30px',
                    boxShadow: '0px 4px 15px rgba(0,0,0,0.15)',
                    display: 'flex',
                    gap: '5px',
                }}
            >
                <button
                    onClick={() => setViewMode('markers')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '25px',
                        border: 'none',
                        background: viewMode === 'markers' ? '#1976d2' : 'transparent',
                        color: viewMode === 'markers' ? 'white' : '#333',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.3s',
                    }}
                >
                    Иконки ДТП
                </button>
                <button
                    onClick={() => setViewMode('heatmap')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '25px',
                        border: 'none',
                        background: viewMode === 'heatmap' ? '#1976d2' : 'transparent',
                        color: viewMode === 'heatmap' ? 'white' : '#333',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.3s',
                    }}
                >
                    Тепловая карта + Маршрут
                </button>
            </div>

            <div id='map-container' style={{ width: '100%', height: '100%' }} />

            {viewMode === 'heatmap' && (
                <div
                    style={{
                        position: 'absolute',
                        top: 80,
                        left: 20,
                        zIndex: 10,
                        display: 'flex',
                        gap: '10px',
                    }}
                >
                    <button
                        onClick={buildRoute}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#1976d2',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        Построить маршрут
                    </button>

                    <button
                        onClick={clearRoute}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#d32f2f',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        Скрыть маршрут
                    </button>
                </div>
            )}

            {viewMode === 'heatmap' && routeVisible && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        zIndex: 10,
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '14px',
                        borderRadius: '10px',
                        width: '220px',
                        fontSize: '14px',
                        lineHeight: '1.6',
                    }}
                >
                    <b>Туристический маршрут</b>
                    <ol style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        {touristPoints.map((point, index) => (
                            <li key={index}>{point.name}</li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}
