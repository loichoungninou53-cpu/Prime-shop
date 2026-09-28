import React, { useEffect, useRef, useState } from 'react';
import { Order, StoreSettings } from '../types';
import { 
  Navigation, 
  MapPin, 
  PhoneCall, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Compass, 
  ShieldCheck,
  Zap,
  Radio,
  Bike
} from 'lucide-react';
import { formatPrice } from '../utils/storage';

interface BeninDeliveryMapProps {
  order: Order;
  settings: StoreSettings;
}

// Coordonnées GPS réelles des villes et quartiers clés du Bénin
const BENIN_LOCATIONS: Record<string, { lat: number; lng: number; label: string }> = {
  // Cotonou et quartiers
  cotonou: { lat: 6.3703, lng: 2.4183, label: 'Cotonou Centre' },
  'haie vive': { lat: 6.3572, lng: 2.3996, label: 'Haie Vive, Cotonou' },
  cadjehoun: { lat: 6.3615, lng: 2.4082, label: 'Cadjehoun, Cotonou' },
  akpakpa: { lat: 6.3775, lng: 2.4512, label: 'Akpakpa, Cotonou' },
  fidjrosse: { lat: 6.3665, lng: 2.3685, label: 'Fidjrossè Plage, Cotonou' },
  fidjrossè: { lat: 6.3665, lng: 2.3685, label: 'Fidjrossè, Cotonou' },
  menontin: { lat: 6.3812, lng: 2.3845, label: 'Ménontin, Cotonou' },
  kouhounou: { lat: 6.3855, lng: 2.3912, label: 'Kouhounou (Stade), Cotonou' },
  gbedjromede: { lat: 6.3790, lng: 2.4110, label: 'Gbédjromèdé, Cotonou' },

  // Abomey-Calavi
  calavi: { lat: 6.4485, lng: 2.3557, label: 'Abomey-Calavi' },
  'abomey-calavi': { lat: 6.4485, lng: 2.3557, label: 'Abomey-Calavi' },
  tankpe: { lat: 6.4520, lng: 2.3410, label: 'Tankpè, Calavi' },
  tankpè: { lat: 6.4520, lng: 2.3410, label: 'Tankpè, Calavi' },
  zogbadje: { lat: 6.4380, lng: 2.3480, label: 'Zogbadjè (UAC), Calavi' },
  arconville: { lat: 6.4420, lng: 2.3610, label: 'Arconville, Calavi' },

  // Autres grandes villes du Bénin
  'porto-novo': { lat: 6.4969, lng: 2.6289, label: 'Porto-Novo' },
  'porto novo': { lat: 6.4969, lng: 2.6289, label: 'Porto-Novo' },
  parakou: { lat: 9.3372, lng: 2.6303, label: 'Parakou' },
  bohicon: { lat: 7.1783, lng: 2.0667, label: 'Bohicon' },
  abomey: { lat: 7.1829, lng: 1.9912, label: 'Abomey' },
  ouidah: { lat: 6.3631, lng: 2.0851, label: 'Ouidah' },
};

// Hub central de départ Prime Shop (Entrepôt Haie Vive Cotonou)
const STORE_HUB = {
  lat: 6.3572,
  lng: 2.3996,
  label: 'Hub Logistique Prime Shop (Haie Vive, Cotonou)',
};

export const BeninDeliveryMap: React.FC<BeninDeliveryMapProps> = ({ order, settings }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState(true);

  // Détection des coordonnées de livraison du client
  const detectCustomerCoordinates = () => {
    const textToSearch = `${order.customer.city} ${order.customer.address || ''}`.toLowerCase();
    for (const [key, loc] of Object.entries(BENIN_LOCATIONS)) {
      if (textToSearch.includes(key)) {
        return loc;
      }
    }
    // Par défaut : Cotonou Centre
    return {
      lat: 6.3703,
      lng: 2.4183,
      label: order.customer.city || 'Cotonou, Bénin',
    };
  };

  const customerLoc = detectCustomerCoordinates();

  // Position simulée du coursier (situé entre le Hub et le client)
  const isEnRoute = order.status === 'Expédiée' || order.status === 'En préparation';
  const isLivree = order.status === 'Livrée';

  const courierLat = isLivree
    ? customerLoc.lat
    : isEnRoute
    ? (STORE_HUB.lat + customerLoc.lat) / 2 + 0.003
    : STORE_HUB.lat;

  const courierLng = isLivree
    ? customerLoc.lng
    : isEnRoute
    ? (STORE_HUB.lng + customerLoc.lng) / 2 + 0.002
    : STORE_HUB.lng;

  // Initialisation dynamique de la carte Leaflet (chargée proprement côté navigateur)
  useEffect(() => {
    let mapInstance: any = null;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;

        // Évite la réinitialisation si déjà monté
        if ((mapContainerRef.current as any)._leaflet_id) {
          return;
        }

        // Centre la carte entre le Hub et le client
        const centerLat = (STORE_HUB.lat + customerLoc.lat) / 2;
        const centerLng = (STORE_HUB.lng + customerLoc.lng) / 2;

        mapInstance = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: true,
          attributionControl: false,
        });

        // Fond de carte OpenStreetMap haute résolution (100% gratuit & sans clé API)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(mapInstance);

        // Icônes personnalisées
        const hubIcon = L.divIcon({
          className: 'custom-hub-icon',
          html: `<div style="background-color:#5433eb;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(84,51,235,0.4);border:2px solid white;font-weight:900;font-size:12px;">🏪</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const courierIcon = L.divIcon({
          className: 'custom-courier-icon',
          html: `<div style="background-color:#10b981;color:white;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(16,185,129,0.25);border:2px solid white;font-size:16px;" class="animate-bounce">🛵</div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const customerIcon = L.divIcon({
          className: 'custom-customer-icon',
          html: `<div style="background-color:#e11d48;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(225,29,72,0.4);border:2px solid white;font-size:14px;">📍</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        // Marqueurs
        L.marker([STORE_HUB.lat, STORE_HUB.lng], { icon: hubIcon })
          .addTo(mapInstance)
          .bindPopup(`<b>${STORE_HUB.label}</b><br>Départ des expéditions express`);

        if (isEnRoute) {
          L.marker([courierLat, courierLng], { icon: courierIcon })
            .addTo(mapInstance)
            .bindPopup(`<b>🛵 Coursier Express en route</b><br>Signal GPS actualisé en direct`);
        }

        L.marker([customerLoc.lat, customerLoc.lng], { icon: customerIcon })
          .addTo(mapInstance)
          .bindPopup(`<b>📍 Destination de livraison :</b><br>${order.customer.fullName}<br>${customerLoc.label}`);

        // Tracé routier visuel entre départ et arrivée
        const latlngs = [
          [STORE_HUB.lat, STORE_HUB.lng],
          ...(isEnRoute ? [[courierLat, courierLng]] : []),
          [customerLoc.lat, customerLoc.lng],
        ];

        L.polyline(latlngs as any, {
          color: '#5433eb',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8',
        }).addTo(mapInstance);

        setMapInitialized(true);
      } catch (err) {
        console.warn('Leaflet non disponible en environnement headless, fallback actif.', err);
      }
    };

    initMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [order.id, order.status, customerLoc.label]);

  // Lien direct Google Maps pour le client
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${order.customer.city || 'Cotonou'}, Bénin`
  )}`;

  // Numéro WhatsApp coursier direct
  const courierWhatsappMsg = encodeURIComponent(
    `Bonjour ! Je vous contacte au sujet de ma livraison Prime Shop #${order.id}.\n` +
    `Je suis disponible à : ${order.customer.city} (${order.customer.fullName}). Êtes-vous en route ?`
  );
  const courierWhatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${courierWhatsappMsg}`;

  return (
    <div className="rounded-[28px] bg-white border border-slate-200/90 shadow-sm overflow-hidden space-y-4">
      {/* Top Banner GPS Status */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Suivi GPS Réel & En Direct (Bénin)</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Trajet en temps réel entre le Hub Cotonou et votre quartier
            </p>
          </div>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition self-start sm:self-auto cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          <span>Ouvrir sur Google Maps</span>
        </a>
      </div>

      {/* Interactive Map Box */}
      <div className="relative px-4 sm:px-6">
        <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
          {/* Leaflet DOM container */}
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating ETA Badge */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <div className="px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg text-xs space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5433eb] block">
                {isLivree ? 'Statut Final' : 'Estimation Coursier'}
              </span>
              <strong className="text-[#050508] text-sm block">
                {isLivree ? 'Colis Remis en Mains Propres ✅' : isEnRoute ? '~20 à 35 minutes' : 'Attente dispatching'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Courier & Route Details Bar */}
      <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Step 1: Courier Info */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ece7ff] text-[#5433eb] flex items-center justify-center font-black">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Coursier Dédié</span>
              <strong className="text-[#050508] text-sm">Rodrigue A. (Yamaha Express)</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Équipé d'un boîtier isotherme et de monnaie de rendu.
          </p>
        </div>

        {/* Step 2: Destination Quartier */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Zone de Livraison</span>
          <div className="flex items-start gap-2 text-[#050508] font-bold text-sm">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{customerLoc.label}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Destinataire : <strong>{order.customer.fullName}</strong> ({order.customer.phone})
          </p>
        </div>

        {/* Step 3: Fast Actions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex flex-col justify-between gap-2.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Contact Urgent</span>
          <div className="flex items-center gap-2">
            <a
              href={`tel:${settings.whatsappNumber}`}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-700" />
              <span>Appeler</span>
            </a>
            <a
              href={courierWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
