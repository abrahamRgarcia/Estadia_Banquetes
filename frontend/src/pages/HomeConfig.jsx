import React, { useState, useEffect } from 'react';
import NavbarInventory from '../components/NavbarInventory';
import api, { getHomeSections, updateHomeSection, uploadHomeSectionImage, deleteHomeSectionImage } from '../api';
import { toast } from 'react-toastify';
import '../styles/HomeConfig.css';

const SECTIONS = [
    { id: 'about', label: 'Sobre Nosotros' },
    { id: 'social', label: 'Sociales' },
    { id: 'corporate', label: 'Corporativos' },
    { id: 'government', label: 'Gubernamentales' },
    { id: 'camerinos', label: 'Camerinos' },
    { id: 'adicionales', label: 'Adicionales' },
];

const HomeConfig = () => {
    const [activeSection, setActiveSection] = useState('about');
    const [sectionData, setSectionData] = useState({
        title: '',
        description: '',
        extra_text: '',
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchSectionData(activeSection);
    }, [activeSection]);

    const fetchSectionData = async (sectionId) => {
        setLoading(true);
        try {
            // Try to get specific section, if not exists (404), we might need to create it or handle empty
            // Ideally backend should return empty structure or we create on first save.
            // For now assuming we fetch list and find, or fetch by ID.
            // Our API is /api/home-sections/{name}/

            try {
                const res = await api.get(`api/inventory/home-sections/${sectionId}/`);
                setSectionData(res.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    // Section doesn't exist yet, reset form
                    setSectionData({ title: '', description: '', extra_text: '', images: [] });
                } else {
                    toast.error("Error al cargar datos de la sección");
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveText = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Check if exists by trying to update, if 404 then create (POST)
            // Actually ModelViewSet update requires ID usually, but we set lookup_field='name'
            // So PUT/PATCH to /api/home-sections/about/ should work if it exists.
            // If it doesn't exist, we might need to POST to /api/home-sections/ with name='about'

            try {
                await updateHomeSection(activeSection, {
                    title: sectionData.title,
                    description: sectionData.description,
                    extra_text: sectionData.extra_text
                });
                toast.success("Información actualizada");
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    // Create new
                    await api.post('api/inventory/home-sections/', {
                        name: activeSection,
                        title: sectionData.title,
                        description: sectionData.description,
                        extra_text: sectionData.extra_text
                    });
                    toast.success("Sección creada y guardada");
                    fetchSectionData(activeSection); // Refresh to get ID/Images structure
                } else {
                    throw err;
                }
            }
        } catch (error) {
            toast.error("Error al guardar cambios");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);
        formData.append('caption', ''); // Optional caption input could be added

        setUploading(true);
        try {
            await uploadHomeSectionImage(activeSection, formData);
            toast.success("Imagen subida");
            fetchSectionData(activeSection); // Refresh images
        } catch (error) {
            toast.error("Error al subir imagen");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm("¿Estás seguro de eliminar esta imagen?")) return;
        try {
            await deleteHomeSectionImage(activeSection, imageId);
            toast.success("Imagen eliminada");
            fetchSectionData(activeSection);
        } catch (error) {
            toast.error("Error al eliminar imagen");
        }
    };

    return (
        <div className="inventory-page">
            <NavbarInventory />
            <div className="inventory-main-content">
                <header className="inventory-header">
                    <h1>Configuración de Página de Inicio</h1>
                </header>

                <div className="config-container">
                    <div className="config-sidebar">
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                className={`config-tab ${activeSection === section.id ? 'active' : ''}`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>

                    <div className="config-content">
                        <h2>Editando: {SECTIONS.find(s => s.id === activeSection)?.label}</h2>

                        {loading ? <p>Cargando...</p> : (
                            <>
                                <form onSubmit={handleSaveText} className="config-form">
                                    <div className="form-group">
                                        <label>Título</label>
                                        <input
                                            type="text"
                                            value={sectionData.title}
                                            onChange={(e) => setSectionData({ ...sectionData, title: e.target.value })}
                                            placeholder="Título de la sección"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Descripción</label>
                                        <textarea
                                            value={sectionData.description}
                                            onChange={(e) => setSectionData({ ...sectionData, description: e.target.value })}
                                            placeholder="Descripción principal"
                                            rows={5}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Texto Adicional / Detalles</label>
                                        <textarea
                                            value={sectionData.extra_text}
                                            onChange={(e) => setSectionData({ ...sectionData, extra_text: e.target.value })}
                                            placeholder="Texto extra (ej. listas, notas al pie)"
                                            rows={3}
                                        />
                                    </div>
                                    <button type="submit" className="save-btn">Guardar Textos</button>
                                </form>

                                <div className="images-section">
                                    <h3>Imágenes</h3>
                                    <div className="images-grid">
                                        {sectionData.images && sectionData.images.map(img => (
                                            <div key={img.id} className="image-card">
                                                <img src={img.image} alt={img.caption} />
                                                <button onClick={() => handleDeleteImage(img.id)} className="delete-btn">×</button>
                                            </div>
                                        ))}
                                        <div className="upload-card">
                                            <label className="upload-label">
                                                {uploading ? 'Subiendo...' : '+ Agregar Imagen'}
                                                <input type="file" onChange={handleImageUpload} accept="image/*" disabled={uploading} hidden />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeConfig;
