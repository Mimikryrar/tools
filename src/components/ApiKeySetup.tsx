import React, { useState } from 'react';

type Provider = 'gemini' | 'replicate';

interface ApiKeySetupProps {
  onKeySet: (data: { provider: Provider; key: string }) => void;
}

const PROVIDERS: { id: Provider; name: string; subtext: string; placeholder: string; prefix: string; link: string; linkLabel: string }[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    subtext: 'Best quality img2img — transforms your actual room photo',
    placeholder: 'AIza...',
    prefix: 'AIza',
    link: 'https://aistudio.google.com/apikey',
    linkLabel: 'aistudio.google.com/apikey',
  },
  {
    id: 'replicate',
    name: 'Stable Diffusion',
    subtext: 'Free tier available — generates new room from style description',
    placeholder: 'r8_...',
    prefix: 'r8_',
    link: 'https://replicate.com/account/api-tokens',
    linkLabel: 'replicate.com/account/api-tokens',
  },
];

export default function ApiKeySetup({ onKeySet }: ApiKeySetupProps) {
  const [provider, setProvider] = useState<Provider>('gemini');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const active = PROVIDERS.find(p => p.id === provider)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.startsWith(active.prefix)) {
      setError(`Invalid key — ${active.name} keys start with "${active.prefix}".`);
      return;
    }
    localStorage.setItem('logos-provider', provider);
    localStorage.setItem(`logos-${provider}-key`, key);
    onKeySet({ provider, key });
  };

  const handleProviderChange = (p: Provider) => {
    setProvider(p);
    setKey('');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f2ed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 300,
        fontSize: '4rem',
        color: '#1a1a1a',
        lineHeight: 1,
        marginBottom: '1.5rem',
      }}>
        λόγος
      </h1>

      <div style={{ width: '4rem', height: '1px', backgroundColor: '#d4af7a', marginBottom: '2rem' }} />

      <div style={{ width: '100%', maxWidth: '480px' }}>
        <h2 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 300,
          fontSize: '1.5rem',
          color: '#1a1a1a',
          marginBottom: '1.5rem',
        }}>
          Choose your AI provider
        </h2>

        {/* Provider Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.75rem' }}>
          {PROVIDERS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleProviderChange(p.id)}
              style={{
                padding: '1rem',
                border: `1.5px solid ${provider === p.id ? '#d4af7a' : '#e5e0d8'}`,
                borderRadius: '0.875rem',
                backgroundColor: provider === p.id ? 'rgba(212,175,122,0.06)' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background-color 0.15s',
                outline: 'none',
              }}
            >
              <div style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: provider === p.id ? '#1a1a1a' : 'rgba(26,26,26,0.7)',
                marginBottom: '0.375rem',
              }}>
                {p.name}
              </div>
              <div style={{
                fontSize: '0.6875rem',
                color: 'rgba(26,26,26,0.45)',
                lineHeight: 1.5,
              }}>
                {p.subtext}
              </div>
            </button>
          ))}
        </div>

        {/* Key Input */}
        <p style={{
          fontSize: '0.8125rem',
          color: 'rgba(26,26,26,0.6)',
          lineHeight: 1.6,
          marginBottom: '0.5rem',
          textAlign: 'left',
        }}>
          Your key is stored locally in your browser — never sent to our servers.
        </p>

        <a
          href={active.link}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            color: '#d4af7a',
            marginBottom: '1rem',
            textDecoration: 'none',
          }}
        >
          Get your key at {active.linkLabel} →
        </a>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(''); }}
            placeholder={active.placeholder}
            autoComplete="off"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid #e5e0d8',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              backgroundColor: 'white',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#d4af7a')}
            onBlur={e => (e.currentTarget.style.borderColor = '#e5e0d8')}
          />

          {error && (
            <p style={{ fontSize: '0.75rem', color: '#ef4444', textAlign: 'left', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              padding: '0.75rem',
              border: '1px solid #d4af7a',
              borderRadius: '9999px',
              backgroundColor: '#d4af7a',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Continue
          </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('logos-provider', 'gemini');
              localStorage.setItem('logos-gemini-key', 'DEMO');
              onKeySet({ provider: 'gemini', key: 'DEMO' });
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.8125rem',
              color: 'rgba(26,26,26,0.5)',
              cursor: 'pointer',
              padding: '0.25rem 0',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#d4af7a')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(26,26,26,0.5)')}
          >
            Try Demo Mode
          </button>
          <p style={{ fontSize: '0.6875rem', color: 'rgba(26,26,26,0.35)', margin: 0 }}>
            Demo mode uses simulated responses — no API key required
          </p>
        </div>
      </div>
    </div>
  );
}
