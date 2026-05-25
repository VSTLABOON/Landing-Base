// ─── STORE NOT FOUND PAGE ────────────────────────────────────────
// Página 404 para subdominios o custom domains que no tienen
// una tienda registrada en la base de datos.
//
// Se muestra cuando TenantContext resuelve status = 'not_found'.
// ────────────────────────────────────────────────────────────────

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';

export default function StoreNotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Tienda no encontrada | BotaniQ</title>
        <meta name="description" content="La tienda que buscas no existe o ha sido desactivada." />
      </Helmet>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        padding: '2rem',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '480px',
          color: '#e0e0e0',
        }}>
          {/* Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <Store style={{ width: '36px', height: '36px', color: '#888' }} />
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
          }}>
            Tienda no encontrada
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.5)',
            marginBottom: '2rem',
          }}>
            La dirección que ingresaste no corresponde a ninguna tienda
            registrada en nuestra plataforma, o ha sido desactivada.
          </p>

          {/* CTA */}
          <Link
            to="/plataforma"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Volver a BotaniQ
          </Link>
        </div>
      </div>
    </>
  );
}
