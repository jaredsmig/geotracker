/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

type Weather = {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
};

function App() {
  const [count, setCount] = useState(0);
  const [weather, setWeather] = useState<Weather[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const trackLayerRef = useRef<any>(null);
  const currentLayerRef = useRef<any>(null);

  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://geotracker-api-env.eba-qm3rwtee.us-east-1.elasticbeanstalk.com/";
  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}weatherforecast`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setWeather(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Minimal ArcGIS map setup using CDN AMD loader (window.require)
  useEffect(() => {
    const w = window as any;
    if (!mapDivRef.current || !w.require) return;

    w.require(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/GeoJSONLayer",
        "esri/renderers/SimpleRenderer",
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/SimpleMarkerSymbol",
      ],
      (
        EsriMap: any,
        MapView: any,
        GeoJSONLayer: any,
        SimpleRenderer: any,
        SimpleLineSymbol: any,
        SimpleMarkerSymbol: any,
      ) => {
        const map = new EsriMap({ basemap: "streets-vector" });
        const view = new MapView({
          container: mapDivRef.current,
          map,
          center: [-122.4194, 37.7749],
          zoom: 13,
        });

        const geoJsonUrl = `${apiUrl}tracks.geojson`;
        const trackLayer = new GeoJSONLayer({
          url: geoJsonUrl,
          title: "Asset 123 Track",
          definitionExpression: "kind = 'track'",
          renderer: new SimpleRenderer({
            symbol: new SimpleLineSymbol({ color: [0, 122, 255, 1], width: 3 }),
          }),
        });

        const currentLayer = new GeoJSONLayer({
          url: geoJsonUrl,
          title: "Current Position",
          definitionExpression: "kind = 'current'",
          renderer: new SimpleRenderer({
            symbol: new SimpleMarkerSymbol({
              color: [255, 64, 64, 1],
              size: 10,
              outline: { color: [255, 255, 255, 1], width: 1 },
            }),
          }),
        });

        map.addMany([trackLayer, currentLayer]);
        trackLayerRef.current = trackLayer;
        currentLayerRef.current = currentLayer;

        Promise.all([trackLayer.when(), currentLayer.when()])
          .then(() => trackLayer.queryExtent())
          .then(
            (res: any) =>
              res && res.extent && view.goTo(res.extent.expand(1.2)),
          )
          .finally(() => setMapReady(true));

        return () => {
          view?.destroy?.();
        };
      },
    );
  }, [apiUrl]);

  const refreshTrack = () => {
    const base = `${apiUrl}tracks.geojson`;
    const cacheBust = `${base}?t=${Date.now()}`;
    if (trackLayerRef.current) {
      trackLayerRef.current.url = cacheBust;
      trackLayerRef.current.refresh?.();
    }
    if (currentLayerRef.current) {
      currentLayerRef.current.url = cacheBust;
      currentLayerRef.current.refresh?.();
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button
          onClick={fetchWeather}
          disabled={loading}
          style={{ marginLeft: "1em" }}
        >
          {loading ? "Loading..." : "Fetch Weather"}
        </button>
        <button
          onClick={refreshTrack}
          disabled={!mapReady}
          style={{ marginLeft: "1em" }}
        >
          {mapReady ? "Refresh Track" : "Loading Map..."}
        </button>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {weather.length > 0 && (
          <table style={{ marginTop: "1em", width: "100%" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Temp (C)</th>
                <th>Temp (F)</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {weather.map((w, i) => (
                <tr key={i}>
                  <td>{w.date}</td>
                  <td>{w.temperatureC}</td>
                  <td>{w.temperatureF}</td>
                  <td>{w.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <div id="mapDiv" ref={mapDivRef} />
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
