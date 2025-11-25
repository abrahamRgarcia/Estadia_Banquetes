import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';
import '../styles/Home.new.css';

const Home = () => {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await api.get('api/inventory/home-sections/');
        // Convert array to object keyed by name for easier access
        const sectionsMap = {};
        res.data.forEach(section => {
          sectionsMap[section.name] = section;
        });
        setSections(sectionsMap);
      } catch (error) {
        console.error("Error fetching home sections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const getSection = (name) => sections[name] || {};
  const getImages = (name) => getSection(name).images || [];
  const getImageSrc = (name, index) => {
    const images = getImages(name);
    return images[index] ? images[index].image : null;
  };

  if (loading) return <div className="loading-screen">Cargando...</div>;

  return (
    <div className="home-container">
      <Navbar />
      <section id="inicio" className="hero-section">
        <span className="reference-number">01</span>
        <div className="hero-content">
          <h1>BANQUETES</h1>
          <p className="brand-name">Boyás</p>
        </div>
      </section>

      {/* SOBRE NOSOTROS */}
      <section id="sobre-nosotros" className="about-section">
        <div className="container">
          <h2 className="section-title">{getSection('about').title || 'Sobre Nosotros'}</h2>
          <div className="about-content">
            <div className="about-image">
              {getImageSrc('about', 0) ? (
                <img src={getImageSrc('about', 0)} alt="Sobre Nosotros" />
              ) : (
                <div className="image-placeholder"><span>Imagen de presentación</span></div>
              )}
            </div>
            <div className="about-text">
              <p className="about-description">
                {getSection('about').description || 'Descripción no disponible.'}
              </p>
              {getSection('about').extra_text && (
                <div className="about-features-text">
                  {getSection('about').extra_text.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIALES */}
      <section id="sociales" className="social-section">
        <div className="container">
          <h2 className="section-title">{getSection('social').title || 'Sociales'}</h2>
          <div className="social-grid">
            {getImages('social').length > 0 ? getImages('social').map((img, idx) => (
              <div key={img.id} className="social-item">
                <img src={img.image} alt={img.caption || `Social ${idx}`} className="grid-image" />
                {img.caption && <h3 className="social-item-title">{img.caption}</h3>}
              </div>
            )) : (
              // Fallback if no images
              <>
                <div className="social-item"><div className="social-image-placeholder"><span>Sin imagen</span></div></div>
                <div className="social-item"><div className="social-image-placeholder"><span>Sin imagen</span></div></div>
                <div className="social-item"><div className="social-image-placeholder"><span>Sin imagen</span></div></div>
              </>
            )}
          </div>
          <div className="social-events">
            <p>{getSection('social').extra_text || 'Cumpleaños • Bautizos • Gender Reveal • Baby Shower • Fiestas Temáticas'}</p>
          </div>
        </div>
      </section>

      {/* CORPORATIVOS */}
      <section id="corporativos" className="corporate-section">
        <div className="container">
          <h2 className="section-title">{getSection('corporate').title || 'Corporativos'}</h2>
          <div className="corporate-grid">
            {getImages('corporate').length > 0 ? getImages('corporate').map((img, idx) => (
              <div key={img.id} className="corporate-item">
                <img src={img.image} alt={img.caption} className="grid-image" />
                {img.caption && <h3 className="corporate-item-title">{img.caption}</h3>}
              </div>
            )) : (
              <p>No hay imágenes disponibles.</p>
            )}
          </div>
          <div className="corporate-events">
            <p>{getSection('corporate').extra_text || 'COFFEE BREAKS • ANIVERSARIOS • BOCADILLOS GOURMET'}</p>
          </div>
        </div>
      </section>

      {/* GUBERNAMENTALES */}
      <section id="gubernamentales" className="government-section">
        <div className="container">
          <h2 className="section-title">{getSection('government').title || 'Gubernamentales'}</h2>
          <div className="government-grid">
            {getImages('government').length > 0 ? getImages('government').map((img, idx) => (
              <div key={img.id} className="government-item">
                <img src={img.image} alt={img.caption} className="grid-image" />
                {img.caption && <h3 className="government-item-title">{img.caption}</h3>}
              </div>
            )) : (
              <p>No hay imágenes disponibles.</p>
            )}
          </div>
          {getSection('government').extra_text && (
            <div className="government-text">
              <p>{getSection('government').extra_text}</p>
            </div>
          )}
        </div>
      </section>

      {/* CAMERINOS */}
      <section id="camerinos" className="dressing-room-section">
        <div className="container">
          <h2 className="section-title">{getSection('camerinos').title || 'Camerinos'}</h2>
          <div className="dressing-room-grid">
            {getImages('camerinos').length > 0 ? getImages('camerinos').map((img, idx) => (
              <div key={img.id} className="dressing-room-item">
                <img src={img.image} alt={img.caption} className="grid-image" />
              </div>
            )) : (
              <p>No hay imágenes disponibles.</p>
            )}
          </div>
          <div className="dressing-room-title">
            <h3>{getSection('camerinos').description}</h3>
            <div className="dressing-room-artists">
              <p>{getSection('camerinos').extra_text}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ADICIONALES */}
      <section id="adicionales" className="additional-section">
        <div className="container">
          <h2 className="section-title">{getSection('adicionales').title || 'Adicionales'}</h2>
          <div className="additional-grid">
            {getImages('adicionales').length > 0 ? getImages('adicionales').map((img, idx) => (
              <div key={img.id} className="additional-item">
                <img src={img.image} alt={img.caption} className="grid-image" />
              </div>
            )) : (
              <p>No hay imágenes disponibles.</p>
            )}
          </div>
          <div className="additional-services">
            <p>{getSection('adicionales').extra_text}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
