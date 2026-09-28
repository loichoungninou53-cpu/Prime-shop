-- ==============================================================================
-- 👑 SCHEMA DE BASE DE DONNÉES SUPABASE POUR PRIME SHOP (100% GRATUIT)
-- ==============================================================================
-- Ce fichier contient toutes les tables, règles de sécurité et données de départ.
-- Pour l'exécuter :
-- 1. Rendez-vous sur votre tableau de bord https://supabase.com
-- 2. Ouvrez votre projet puis cliquez sur "SQL Editor" dans le menu de gauche.
-- 3. Cliquez sur "New query", collez TOUT ce script, puis cliquez sur "Run".
-- ==============================================================================

-- 1. Table des Produits (Catalogue Prime Shop)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'electronique',
    category_label TEXT NOT NULL DEFAULT 'Électronique',
    price NUMERIC NOT NULL DEFAULT 0,
    old_price NUMERIC,
    stock INTEGER NOT NULL DEFAULT 10,
    featured BOOLEAN DEFAULT true,
    is_new BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'published',
    image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    catchphrase TEXT,
    key_benefits JSONB DEFAULT '[]'::jsonb,
    box_content JSONB DEFAULT '[]'::jsonb,
    warranty_notice TEXT DEFAULT 'Garantie 12 mois avec remplacement sous 48h.',
    description TEXT,
    specs JSONB DEFAULT '[]'::jsonb,
    rating NUMERIC DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des Commandes Clients (Avec Suivi de Colis)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer JSONB NOT NULL, -- { fullName, phone, city, address, note }
    items JSONB NOT NULL,    -- [ { productId, name, price, quantity, image } ]
    subtotal NUMERIC NOT NULL,
    delivery_fee NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    payment_method TEXT DEFAULT 'cod',
    payment_method_label TEXT DEFAULT 'Paiement à la livraison',
    status TEXT DEFAULT 'Nouvelle', -- 'Nouvelle', 'Confirmée', 'En préparation', 'Expédiée', 'Livrée', 'Annulée'
    created_at TEXT NOT NULL,
    updated_at TEXT
);

-- 3. Table des Paramètres de la Boutique
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    store_name TEXT NOT NULL DEFAULT 'Prime Shop',
    tagline TEXT DEFAULT 'L''élégance rencontre le craft • Tout ce qu''il vous faut. Au même endroit.',
    currency TEXT NOT NULL DEFAULT 'FCFA',
    delivery_fee NUMERIC DEFAULT 1500,
    free_delivery_threshold NUMERIC DEFAULT 35000,
    whatsapp_number TEXT NOT NULL DEFAULT '22997000000',
    whatsapp_greeting TEXT DEFAULT 'Bonjour Prime Shop, je souhaite passer une commande.',
    facebook_pixel_id TEXT DEFAULT '109823471829381',
    facebook_pixel_enabled BOOLEAN DEFAULT true,
    admin_pin TEXT DEFAULT 'admin123',
    admin_secret_slug TEXT DEFAULT 'gestion-prime',
    banner_notice TEXT DEFAULT '⚡ Livraison offerte dès 35 000 FCFA d''achats ! Paiement à la réception à Cotonou & Calavi.',
    banner_enabled BOOLEAN DEFAULT true,
    instagram_handle TEXT DEFAULT 'primeshop.bj',
    tiktok_handle TEXT DEFAULT 'primeshop.bj',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Activation de la Sécurité Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique (Les visiteurs peuvent voir les produits et paramètres)
CREATE POLICY "Lecture publique des produits publiés" ON public.products
    FOR SELECT USING (status = 'published');

CREATE POLICY "Lecture publique des paramètres" ON public.store_settings
    FOR SELECT USING (true);

-- Politique de commande : Les clients peuvent envoyer une commande en 1 clic
CREATE POLICY "Création de commande par les clients" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Lecture de commande pour suivi" ON public.orders
    FOR SELECT USING (true);

-- Politiques administratives (Modifications complètes)
CREATE POLICY "Gestion complète produits" ON public.products
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Gestion complète commandes" ON public.orders
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Gestion complète paramètres" ON public.store_settings
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Données initiales par défaut (Paramètres de départ)
INSERT INTO public.store_settings (id, store_name, tagline, currency, delivery_fee, free_delivery_threshold, whatsapp_number, admin_pin)
VALUES ('primary', 'Prime Shop', 'L''élégance rencontre le craft', 'FCFA', 1500, 35000, '22997000000', 'admin123')
ON CONFLICT (id) DO NOTHING;

-- Message de confirmation dans Supabase
SELECT '✅ Félicitations ! Votre base de données Supabase Prime Shop est prête à fonctionner !' AS resultat;
