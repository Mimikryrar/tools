import React, { useState, useCallback } from 'react';
import { Layout, Palette, MessageSquare, Loader2, RefreshCw, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import UploadZone from './components/UploadZone';
import ComparisonSlider from './components/ComparisonSlider';
import StyleCarousel from './components/StyleCarousel';
import ChatInterface from './components/ChatInterface';
import { DESIGN_STYLES, DesignStyle, generateReimaginedImage } from './services/geminiService';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [uploadCount, setUploadCount] = useState(0);
  const [reimaginedImage, setReimaginedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback((base64: string | null, mimeType?: string) => {
    setOriginalImage(base64);
    if (base64) {
      setImageMimeType(mimeType || 'image/jpeg');
      setUploadCount(c => c + 1);
    }
    setReimaginedImage(null);
    setSelectedStyle(null);
    setError(null);
  }, []);

  const handleStyleSelect = async (style: DesignStyle) => {
    if (!originalImage || isGenerating) return;
    
    setSelectedStyle(style);
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateReimaginedImage(originalImage, style.prompt, imageMimeType);
      setReimaginedImage(result);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to reimagine your space. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setReimaginedImage(null);
    setSelectedStyle(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col selection:bg-accent/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 px-6 py-4" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, color: '#f5f2ed' }} className="text-2xl tracking-tight leading-none">λόγος</h1>
              <p className="text-[10px] uppercase font-semibold mt-1" style={{ letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>AI Interior Consultant</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>Studio</a>
            <a href="#" className="text-sm font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>Gallery</a>
            <a href="#" className="text-sm font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>Pricing</a>
          </nav>

          <button
            onClick={reset}
            className="text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full border transition-all"
            style={{ borderColor: '#d4af7a', color: '#d4af7a' }}
          >
            New Project
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {/* Hero Section */}
        {!originalImage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-6"
          >
            <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-[1.1]" style={{ fontWeight: 300 }}>
              Reimagine your space <br />
              <span className="italic" style={{ color: '#d4af7a' }}>with ancient wisdom.</span>
            </h1>
            <p className="text-lg text-ink/60 leading-relaxed">
              λόγος — where proportion meets possibility. Upload your room and consult χρέομαι, your design oracle.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Visualization */}
          <div className="lg:col-span-7 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Layout className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="text-2xl font-serif font-semibold tracking-tight">Your Space</h2>
                </div>
                {isGenerating && (
                  <div className="flex items-center gap-2 text-accent text-sm font-medium animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reimagining...
                  </div>
                )}
              </div>

              <div className="relative">
                <AnimatePresence mode="wait">
                  {!originalImage ? (
                    <UploadZone value={originalImage} onUpload={handleUpload} />
                  ) : (
                    <motion.div
                      key="visualization"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      {reimaginedImage ? (
                        <div className="space-y-3">
                          <ComparisonSlider before={originalImage} after={reimaginedImage} />
                          <div className="flex justify-end">
                            <a
                              href={reimaginedImage}
                              download="logos-reimagined.png"
                              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-ink/10 shadow-lg bg-ink/5 flex items-center justify-center">
                          <img 
                            src={originalImage} 
                            alt="Original" 
                            className={cn("w-full h-full object-cover", isGenerating && "opacity-40 blur-sm")}
                            referrerPolicy="no-referrer"
                          />
                          {isGenerating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-ink">
                              <Loader2 className="w-12 h-12 animate-spin mb-4 opacity-40" />
                              <p className="font-serif italic text-lg">Applying {selectedStyle?.name}...</p>
                            </div>
                          )}
                          {!isGenerating && !reimaginedImage && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-ink/60 bg-white/40 backdrop-blur-sm">
                              <Palette className="w-12 h-12 mb-4 opacity-40" />
                              <p className="font-serif italic text-lg">Select a style to begin</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-3"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {error}
                  </motion.div>
                )}
              </div>
            </section>

            {originalImage && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-accent" />
                  </div>
                  <h2 className="text-2xl font-serif font-semibold tracking-tight">Choose a Style</h2>
                </div>
                <StyleCarousel 
                  selectedStyleId={selectedStyle?.id || null} 
                  onSelect={handleStyleSelect}
                  isGenerating={isGenerating}
                />
              </section>
            )}
          </div>

          {/* Right Column: Chat & Refinement */}
          <div className="lg:col-span-5 space-y-8">
            <section className="h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-accent" />
                </div>
                <h2 className="text-2xl font-serif font-semibold tracking-tight">Consult the Oracle</h2>
              </div>
              
              <div className="flex-1">
                <ChatInterface roomImage={reimaginedImage || originalImage} resetTrigger={uploadCount} />
              </div>

              <div className="mt-6 p-6 rounded-2xl bg-accent/5 border border-accent/10">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-accent mb-2">Pro Tip</h4>
                <p className="text-sm text-ink/70 leading-relaxed">
                  Ask χρέομαι for "shoppable links" to find furniture that matches your reimagined style, or request specific refinements like "change the wall color to sage green".
                </p>
              </div>
            </section>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-ink/5 py-12 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300, fontSize: '1.5rem' }}>λόγος</span>
            </div>
            <p className="text-sm text-ink/60 max-w-sm leading-relaxed">
              Where proportion meets possibility. Combining timeless design principles — reason, harmony, balance — with modern AI expertise.
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-widest mb-4">Product</h5>
            <ul className="space-y-2 text-sm text-ink/60">
              <li><a href="#" className="hover:text-accent transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Styles Library</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">API Access</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-xs uppercase tracking-widest mb-4">Company</h5>
            <ul className="space-y-2 text-sm text-ink/60">
              <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-ink/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink/40">© 2026 λόγος. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-ink/40 hover:text-accent transition-colors"><RefreshCw className="w-4 h-4" /></a>
            <a href="#" className="text-ink/40 hover:text-accent transition-colors"><Layout className="w-4 h-4" /></a>
            <a href="#" className="text-ink/40 hover:text-accent transition-colors"><MessageSquare className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
