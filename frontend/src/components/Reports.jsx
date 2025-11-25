import React, { useState, useEffect } from 'react';
import { FiDownload, FiFileText, FiBarChart2, FiBox, FiTool, FiTrendingUp } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Dynamic import for XLSX to work with Vite
let XLSX;
if (typeof window !== 'undefined') {
  import('xlsx').then(module => {
    XLSX = module;
  });
}

import api from '../api';
import '../styles/Reports.css';

// Inventory categories
const INVENTORY_CATEGORIES = [
  'Manteleria',
  'Cubierto',
  'Loza',
  'Cristaleria',
  'Sillas',
  'Mesas',
  'Salas lounge',
  'Periqueras',
  'Carpas',
  'Pistas y tarimas',
  'Extras'
];

const Reports = () => {
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [warehouseData, setWarehouseData] = useState(null);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [eventAnalysisData, setEventAnalysisData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly'); // 'monthly', 'quarterly', 'yearly'
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('events'); // 'events', 'inventory', 'warehouse', 'maintenance', 'analysis', or 'tastings'

  // Tasting state
  const [tastings, setTastings] = useState([]);
  const [selectedTasting, setSelectedTasting] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchTastings = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/inventory/degustaciones/?year=${selectedYear}&month=${selectedMonth}`);
      if (response.data && Array.isArray(response.data)) {
        setTastings(response.data);
      } else {
        setTastings([]);
      }
    } catch (error) {
      console.error('Error fetching tastings:', error);
      setTastings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch event types
    const fetchEventTypes = async () => {
      try {
        console.log('Fetching event types...');
        const response = await api.get('/api/inventory/tipos-evento/');
        console.log('Event types response:', response);
        if (response.data && Array.isArray(response.data)) {
          setEventTypes(response.data);
          console.log('Event types set:', response.data);
        } else {
          console.error('Unexpected response format:', response);
        }
      } catch (error) {
        console.error('Error fetching event types:', error);
        console.error('Error details:', error.response?.data || error.message);
      }
    };

    fetchEventTypes();
  }, []);

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const fetchEventsByType = async () => {
    if (!selectedType) {
      console.log('No event type selected');
      return;
    }

    setLoading(true);
    console.log(`Fetching events for type: ${selectedType}`);

    try {
      const response = await api.get(`/api/inventory/eventos/?tipo_evento=${selectedType}&ordering=-fecha_inicio`);
      console.log('Events response:', response);

      if (response.data && Array.isArray(response.data)) {
        setEvents(response.data);
        console.log('Events set:', response.data);
      } else {
        console.error('Unexpected events response format:', response);
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      console.error('Error details:', error.response?.data || error.message);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Reporte de Eventos - ${eventTypes.find(t => t.id.toString() === selectedType)?.nombre || ''}`, 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 32);

    // Table data
    const tableColumn = ["Nombre del Evento", "Responsable", "Cantidad de Personas", "Lugar", "Fecha"];
    const tableRows = [];

    events.forEach(event => {
      const eventData = [
        event.nombre,
        event.responsable,
        event.cantidad_personas.toString(),
        event.lugar,
        new Date(event.fecha_inicio).toLocaleDateString(),
      ];
      tableRows.push(eventData);
    });

    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    });

    // Save the PDF
    doc.save(`reporte_eventos_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Generate PDF for a single event with furniture details
  const generateSingleEventPDF = () => {
    if (!selectedEvent) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Reporte de Evento: ${selectedEvent.nombre}`, 14, 22);

    // Event Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Responsable: ${selectedEvent.responsable}`, 14, 32);
    doc.text(`Tipo de Evento: ${selectedEvent.tipo_evento_nombre || 'N/A'}`, 14, 40);
    doc.text(`Fecha: ${new Date(selectedEvent.fecha_inicio).toLocaleDateString()}`, 14, 48);
    doc.text(`Lugar: ${selectedEvent.lugar}`, 14, 56);
    doc.text(`Cantidad de Personas: ${selectedEvent.cantidad_personas}`, 14, 64);

    doc.text('Mobiliario Utilizado:', 14, 76);

    // Furniture Table
    const tableColumn = ["Categoría", "Producto", "Cantidad"];
    const tableRows = [];

    if (selectedEvent.mobiliario_asignado && selectedEvent.mobiliario_asignado.length > 0) {
      selectedEvent.mobiliario_asignado.forEach(item => {
        tableRows.push([
          item.content_type_name || 'N/A',
          item.producto_nombre || 'N/A',
          item.cantidad.toString()
        ]);
      });
    } else {
      tableRows.push(['-', 'Sin mobiliario asignado', '-']);
    }

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    });

    doc.save(`reporte_evento_${selectedEvent.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Generate Excel for a single event
  const generateSingleEventExcel = async () => {
    if (!selectedEvent) return;

    try {
      if (!XLSX) {
        const xlsxModule = await import('xlsx');
        XLSX = xlsxModule;
      }

      // Event Details Sheet
      const eventDetails = [{
        'Nombre del Evento': selectedEvent.nombre,
        'Responsable': selectedEvent.responsable,
        'Tipo de Evento': selectedEvent.tipo_evento_nombre || 'N/A',
        'Fecha': new Date(selectedEvent.fecha_inicio).toLocaleDateString(),
        'Lugar': selectedEvent.lugar,
        'Cantidad de Personas': selectedEvent.cantidad_personas
      }];

      // Furniture Details Sheet
      const furnitureDetails = selectedEvent.mobiliario_asignado ? selectedEvent.mobiliario_asignado.map(item => ({
        'Categoría': item.content_type_name || 'N/A',
        'Producto': item.producto_nombre || 'N/A',
        'Cantidad': item.cantidad
      })) : [];

      const wb = XLSX.utils.book_new();

      const wsDetails = XLSX.utils.json_to_sheet(eventDetails);
      XLSX.utils.book_append_sheet(wb, wsDetails, 'Detalles del Evento');

      if (furnitureDetails.length > 0) {
        const wsFurniture = XLSX.utils.json_to_sheet(furnitureDetails);
        XLSX.utils.book_append_sheet(wb, wsFurniture, 'Mobiliario');
      }

      XLSX.writeFile(wb, `reporte_evento_${selectedEvent.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error al generar el archivo Excel.');
    }
  };

  // Generate PDF for tastings list
  const generateTastingsPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Reporte de Degustaciones', 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Período: ${selectedMonth}/${selectedYear}`, 14, 40);

    // Table data
    const tableColumn = ["Nombre", "Fecha", "Hora", "Responsable", "Alimentos"];
    const tableRows = [];

    tastings.forEach(tasting => {
      const tastingData = [
        tasting.nombre,
        new Date(tasting.fecha_degustacion).toLocaleDateString(),
        tasting.hora_degustacion,
        tasting.responsable,
        tasting.alimentos
      ];
      tableRows.push(tastingData);
    });

    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 48,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    });

    // Save the PDF
    doc.save(`reporte_degustaciones_${selectedMonth}_${selectedYear}.pdf`);
  };

  // Generate PDF for a single tasting
  const generateSingleTastingPDF = () => {
    if (!selectedTasting) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Reporte de Degustación: ${selectedTasting.nombre}`, 14, 22);

    // Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Responsable: ${selectedTasting.responsable}`, 14, 32);
    doc.text(`Fecha: ${new Date(selectedTasting.fecha_degustacion).toLocaleDateString()}`, 14, 40);
    doc.text(`Hora: ${selectedTasting.hora_degustacion}`, 14, 48);
    doc.text(`Alimentos: ${selectedTasting.alimentos}`, 14, 56);

    doc.text('Mobiliario Utilizado:', 14, 68);

    // Furniture Table
    const tableColumn = ["Categoría", "Producto", "Cantidad"];
    const tableRows = [];

    if (selectedTasting.mobiliario_asignado && selectedTasting.mobiliario_asignado.length > 0) {
      selectedTasting.mobiliario_asignado.forEach(item => {
        tableRows.push([
          item.content_type_name || 'N/A',
          item.producto_nombre || 'N/A',
          item.cantidad.toString()
        ]);
      });
    } else {
      tableRows.push(['-', 'Sin mobiliario asignado', '-']);
    }

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 72,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    });

    doc.save(`reporte_degustacion_${selectedTasting.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Generate Excel for single tasting
  const generateSingleTastingExcel = async () => {
    if (!selectedTasting) return;

    try {
      if (!XLSX) {
        const xlsxModule = await import('xlsx');
        XLSX = xlsxModule;
      }

      // Details Sheet
      const details = [{
        'Nombre': selectedTasting.nombre,
        'Responsable': selectedTasting.responsable,
        'Fecha': new Date(selectedTasting.fecha_degustacion).toLocaleDateString(),
        'Hora': selectedTasting.hora_degustacion,
        'Alimentos': selectedTasting.alimentos
      }];

      // Furniture Sheet
      const furniture = selectedTasting.mobiliario_asignado ? selectedTasting.mobiliario_asignado.map(item => ({
        'Categoría': item.content_type_name || 'N/A',
        'Producto': item.producto_nombre || 'N/A',
        'Cantidad': item.cantidad
      })) : [];

      const wb = XLSX.utils.book_new();

      const wsDetails = XLSX.utils.json_to_sheet(details);
      XLSX.utils.book_append_sheet(wb, wsDetails, 'Detalles');

      if (furniture.length > 0) {
        const wsFurniture = XLSX.utils.json_to_sheet(furniture);
        XLSX.utils.book_append_sheet(wb, wsFurniture, 'Mobiliario');
      }

      XLSX.writeFile(wb, `reporte_degustacion_${selectedTasting.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error al generar el archivo Excel.');
    }
  };

  const generateExcel = async (type = 'events') => {
    try {
      // Dynamically import XLSX if not already loaded
      if (!XLSX) {
        const xlsxModule = await import('xlsx');
        XLSX = xlsxModule;
      }

      let excelData, fileName, sheetName;

      if (type === 'inventory') {
        // Prepare inventory data for Excel
        excelData = inventoryItems.map(item => ({
          'Categoría': item.categoria,
          'Nombre': item.nombre,
          'Cantidad Actual': item.cantidad_actual,
          'Bodega': item.bodega_nombre || 'No especificada',
          'Stock Mínimo': item.stock_minimo || 0
        }));
        fileName = `inventario_bajo_stock_${new Date().toISOString().split('T')[0]}.xlsx`;
        sheetName = 'Inventario Bajo Stock';
      } else if (type === 'maintenance') {
        // Prepare maintenance data for Excel
        excelData = maintenanceItems.map(item => ({
          'Categoría': item.categoria,
          'Nombre': item.nombre,
          'Cantidad': item.cantidad_en_mantenimiento,
          'Estado': item.estado,
          'Bodega': item.bodega_nombre || 'No especificada',
          'Fecha': item.fecha ? new Date(item.fecha).toLocaleDateString() : 'N/A'
        }));
        fileName = `reporte_mantenimiento_${new Date().toISOString().split('T')[0]}.xlsx`;
        sheetName = 'Reporte Mantenimiento';
      } else if (type === 'analysis') {
        // Prepare event analysis data for Excel
        excelData = eventAnalysisData.periods.map(period => ({
          'Período': period.period,
          'Cantidad de Eventos': period.count,
          'Porcentaje': `${period.percentage}%`
        }));
        fileName = `analisis_eventos_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`;
        sheetName = 'Análisis de Eventos';
      } else if (type === 'tastings') {
        // Prepare tastings data for Excel
        excelData = tastings.map(tasting => ({
          'Nombre': tasting.nombre,
          'Fecha': new Date(tasting.fecha_degustacion).toLocaleDateString(),
          'Hora': tasting.hora_degustacion,
          'Responsable': tasting.responsable,
          'Alimentos': tasting.alimentos
        }));
        fileName = `reporte_degustaciones_${selectedMonth}_${selectedYear}.xlsx`;
        sheetName = 'Degustaciones';
      } else {
        // Prepare event data for Excel
        excelData = events.map(event => ({
          'Nombre del Evento': event.nombre,
          'Responsable': event.responsable,
          'Cantidad de Personas': event.cantidad_personas,
          'Lugar': event.lugar,
          'Fecha': new Date(event.fecha_inicio).toLocaleDateString(),
        }));
        fileName = `reporte_eventos_${new Date().toISOString().split('T')[0]}.xlsx`;
        sheetName = 'Eventos';
      }

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate Excel file
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, intente de nuevo.');
    }
  };

  // Fetch inventory items with stock below 25
  const fetchLowStockInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/inventory/items/bajo-stock/');
      setInventoryItems(response.data);
    } catch (error) {
      console.error('Error fetching low stock inventory:', error);
      alert('Error al cargar el inventario. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch warehouse inventory report data
  const fetchWarehouseReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/inventory/items/warehouse-report/');
      setWarehouseData(response.data);
    } catch (error) {
      console.error('Error fetching warehouse report:', error);
      alert('Error al cargar el reporte de bodegas. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch maintenance report data
  const fetchMaintenanceReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/inventory/items/maintenance-report/');
      setMaintenanceItems(response.data);
    } catch (error) {
      console.error('Error fetching maintenance report:', error);
      alert('Error al cargar el reporte de mantenimiento. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch event analysis data
  const fetchEventAnalysis = async (period) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/inventory/items/event-analysis/?period=${period}`);
      setEventAnalysisData(response.data);
    } catch (error) {
      console.error('Error fetching event analysis:', error);
      alert('Error al cargar el análisis de eventos. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setSelectedPeriod(newPeriod);
    fetchEventAnalysis(newPeriod);
  };

  // Generate PDF for warehouse report
  const generateWarehousePDF = async () => {
    if (!warehouseData || warehouseData.warehouses.length === 0) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Reporte de Inventario por Bodega', 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Inventario Total: ${warehouseData.total_inventory} unidades`, 14, 40);

    let currentY = 50;

    for (const warehouse of warehouseData.warehouses) {
      // Check if we need a new page
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Warehouse header
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`${warehouse.nombre} - ${warehouse.percentage}% del inventario total`, 14, currentY);
      currentY += 8;

      // Capture Chart
      const chartElement = document.getElementById(`warehouse-chart-${warehouse.id}`);
      if (chartElement) {
        try {
          const canvas = await html2canvas(chartElement);
          const imgData = canvas.toDataURL('image/png');

          // Calculate dimensions to fit PDF width (A4 width is ~210mm)
          const imgWidth = 180; // 180mm width
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if image fits on page
          if (currentY + imgHeight > 280) {
            doc.addPage();
            currentY = 20;
          }

          doc.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10;
        } catch (error) {
          console.error("Error capturing chart:", error);
        }
      }

      // Category table
      const tableColumn = ["Categoría", "Cantidad", "Porcentaje"];
      const tableRows = [];

      warehouse.categories.forEach(cat => {
        if (cat.cantidad > 0) {
          tableRows.push([
            cat.categoria,
            cat.cantidad.toString(),
            `${cat.percentage}%`
          ]);
        }
      });

      if (tableRows.length > 0) {
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: currentY,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
          margin: { left: 14 }
        });

        currentY = doc.lastAutoTable.finalY + 15;
      }
    }

    // Save the PDF
    doc.save(`reporte_inventario_bodegas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Generate Excel for warehouse report
  const generateWarehouseExcel = async () => {
    try {
      if (!XLSX) {
        const xlsxModule = await import('xlsx');
        XLSX = xlsxModule;
      }

      if (!warehouseData || warehouseData.warehouses.length === 0) return;

      const excelData = [];

      warehouseData.warehouses.forEach(warehouse => {
        excelData.push({
          'Bodega': warehouse.nombre,
          'Ubicaci\u00f3n': warehouse.ubicacion,
          'Total Unidades': warehouse.total_items,
          '% del Total': `${warehouse.percentage}%`,
          'Categor\u00eda': '',
          'Cantidad': '',
          '% en Bodega': ''
        });

        warehouse.categories.forEach(cat => {
          if (cat.cantidad > 0) {
            excelData.push({
              'Bodega': '',
              'Ubicaci\u00f3n': '',
              'Total Unidades': '',
              '% del Total': '',
              'Categor\u00eda': cat.categoria,
              'Cantidad': cat.cantidad,
              '% en Bodega': `${cat.percentage}%`
            });
          }
        });

        // Add empty row between warehouses
        excelData.push({
          'Bodega': '',
          'Ubicaci\u00f3n': '',
          'Total Unidades': '',
          '% del Total': '',
          'Categor\u00eda': '',
          'Cantidad': '',
          '% en Bodega': ''
        });
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      XLSX.utils.book_append_sheet(wb, ws, 'Inventario por Bodega');
      XLSX.writeFile(wb, `reporte_inventario_bodegas_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, intente de nuevo.');
    }
  };

  // Generate PDF for maintenance report
  const generateMaintenancePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Reporte de Mantenimiento - Mobiliario', 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text('Últimos 30 días', 14, 40);

    // Table data
    const tableColumn = ["Categoría", "Nombre", "Cantidad", "Estado", "Bodega"];
    const tableRows = [];

    maintenanceItems.forEach(item => {
      const itemData = [
        item.categoria,
        item.nombre,
        item.cantidad_en_mantenimiento.toString(),
        item.estado,
        item.bodega_nombre || 'No especificada'
      ];
      tableRows.push(itemData);
    });

    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 48,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      didDrawPage: function (data) {
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save the PDF
    doc.save(`reporte_mantenimiento_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Generate PDF for event analysis
  const generateEventAnalysisPDF = async () => {
    if (!eventAnalysisData || eventAnalysisData.periods.length === 0) return;

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Análisis de Eventos por Período', 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 32);
    const periodLabel = selectedPeriod === 'monthly' ? 'Mensual' : selectedPeriod === 'quarterly' ? 'Trimestral' : 'Anual';
    doc.text(`Tipo de período: ${periodLabel}`, 14, 40);
    doc.text(`Total de eventos: ${eventAnalysisData.total_events}`, 14, 48);

    let currentY = 56;

    // Capture Chart
    const chartElement = document.getElementById('event-analysis-chart');
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement);
        const imgData = canvas.toDataURL('image/png');

        // Calculate dimensions to fit PDF width (A4 width is ~210mm)
        const imgWidth = 180; // 180mm width
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if image fits on page
        if (currentY + imgHeight > 280) {
          doc.addPage();
          currentY = 20;
        }

        doc.addImage(imgData, 'PNG', 15, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      } catch (error) {
        console.error("Error capturing chart:", error);
      }
    }

    // Table data
    const tableColumn = ["Período", "Cantidad", "Porcentaje"];
    const tableRows = [];

    eventAnalysisData.periods.forEach(period => {
      const periodData = [
        period.period,
        period.count.toString(),
        `${period.percentage}%`
      ];
      tableRows.push(periodData);
    });

    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: currentY,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save the PDF
    doc.save(`analisis_eventos_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Generate PDF for inventory report
  const generateInventoryPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Reporte de Inventario - Bajo Stock', 14, 22);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 32);

    // Table data
    const tableColumn = ["Categoría", "Nombre", "Cantidad Actual", "Bodega"];
    const tableRows = [];

    inventoryItems.forEach(item => {
      const itemData = [
        item.categoria,
        item.nombre,
        item.cantidad_actual.toString(),
        item.bodega_nombre || 'No especificada'
      ];
      tableRows.push(itemData);
    });

    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      didDrawPage: function (data) {
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save the PDF
    doc.save(`inventario_bajo_stock_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Centro de Reportes</h1>
        <p className="reports-subtitle">Genera y analiza reportes de tu negocio</p>
      </div>

      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <FiFileText /> Eventos
        </button>
        <button
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('inventory');
            if (inventoryItems.length === 0) {
              fetchLowStockInventory();
            }
          }}
        >
          <FiBox /> Inventario
        </button>
        <button
          className={`tab-button ${activeTab === 'warehouse' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('warehouse');
            if (!warehouseData) {
              fetchWarehouseReport();
            }
          }}
        >
          <FiBarChart2 /> Bodegas
        </button>
        <button
          className={`tab-button ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('maintenance');
            if (maintenanceItems.length === 0) {
              fetchMaintenanceReport();
            }
          }}
        >
          <FiTool /> Mantenimiento
        </button>
        <button
          className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('analysis');
            if (!eventAnalysisData) {
              fetchEventAnalysis(selectedPeriod);
            }
          }}
        >
          <FiTrendingUp /> Análisis
        </button>
        <button
          className={`tab-button ${activeTab === 'tastings' ? 'active' : ''}`}
          onClick={() => setActiveTab('tastings')}
        >
          <FiFileText /> Degustaciones
        </button>
      </div>

      {activeTab === 'events' ? (
        <>
          <div className="report-controls">
            <select
              value={selectedType}
              onChange={handleTypeChange}
              className="form-select"
            >
              <option value="">Seleccione un tipo de evento</option>
              {eventTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.nombre}
                </option>
              ))}
            </select>

            <button
              onClick={fetchEventsByType}
              className="btn btn-primary"
              disabled={!selectedType || loading}
            >
              {loading && activeTab === 'events' ? 'Cargando...' : 'Buscar Eventos'}
            </button>
          </div>

          {events.length > 0 && (
            <div className="report-actions">
              <button onClick={generatePDF} className="btn btn-export">
                <FiDownload /> Exportar Lista a PDF
              </button>
              <button onClick={() => generateExcel('events')} className="btn btn-export">
                <FiDownload /> Exportar Lista a Excel
              </button>
              {selectedEvent && (
                <>
                  <button onClick={generateSingleEventPDF} className="btn btn-export" style={{ backgroundColor: '#2ecc71', borderColor: '#27ae60' }}>
                    <FiDownload /> Exportar Evento PDF
                  </button>
                  <button onClick={generateSingleEventExcel} className="btn btn-export" style={{ backgroundColor: '#2ecc71', borderColor: '#27ae60' }}>
                    <FiDownload /> Exportar Evento Excel
                  </button>
                </>
              )}
            </div>
          )}

          {loading && activeTab === 'events' ? (
            <div className="loading">Cargando eventos...</div>
          ) : events.length > 0 ? (
            <div className="events-table">
              <p className="instruction-text" style={{ fontStyle: 'italic', color: '#666', marginBottom: '10px' }}>
                * Haga clic en un evento para seleccionarlo y ver opciones de exportación detallada.
              </p>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre del Evento</th>
                    <th>Responsable</th>
                    <th>Cantidad de Personas</th>
                    <th>Lugar</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedEvent?.id === event.id ? '#e8f4f8' : 'inherit',
                        borderLeft: selectedEvent?.id === event.id ? '4px solid #3498db' : 'none'
                      }}
                    >
                      <td>{event.nombre}</td>
                      <td>{event.responsable}</td>
                      <td>{event.cantidad_personas}</td>
                      <td>{event.lugar}</td>
                      <td>{new Date(event.fecha_inicio).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedType ? (
            <div className="no-events">No se encontraron eventos para el tipo seleccionado.</div>
          ) : null}
        </>
      ) : activeTab === 'inventory' ? (
        <>
          <h2>Reporte de Inventario - Bajo Stock</h2>
          <p>Mostrando artículos con existencias por debajo de 25 unidades.</p>

          <div className="report-actions" style={{ margin: '20px 0' }}>
            <button
              onClick={generateInventoryPDF}
              className="btn btn-export"
              disabled={inventoryItems.length === 0}
            >
              <FiDownload /> Exportar a PDF
            </button>
            <button
              onClick={() => generateExcel('inventory')}
              className="btn btn-export"
              disabled={inventoryItems.length === 0}
            >
              <FiDownload /> Exportar a Excel
            </button>
          </div>

          {loading && activeTab === 'inventory' ? (
            <div className="loading">Cargando inventario...</div>
          ) : inventoryItems.length > 0 ? (
            <div className="inventory-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Nombre</th>
                    <th>Cantidad Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Bodega</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item, index) => (
                    <tr key={`${item.id}-${index}`} className={item.cantidad_actual <= (item.stock_minimo || 0) ? 'low-stock' : ''}>
                      <td>{item.categoria}</td>
                      <td>{item.nombre}</td>
                      <td className={item.cantidad_actual <= (item.stock_minimo || 0) ? 'text-danger fw-bold' : ''}>
                        {item.cantidad_actual}
                      </td>
                      <td>{item.stock_minimo || 'No definido'}</td>
                      <td>{item.bodega_nombre || 'No especificada'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-items">No se encontraron artículos con bajo stock.</div>
          )}
        </>
      ) : activeTab === 'warehouse' ? (
        <>
          <h2>Reporte de Inventario por Bodega</h2>
          <p>Visualizaci\u00f3n del inventario distribuido por bodega y categor\u00eda.</p>

          {warehouseData && (
            <div className="report-actions" style={{ margin: '20px 0' }}>
              <button
                onClick={generateWarehousePDF}
                className="btn btn-export"
              >
                <FiDownload /> Exportar a PDF
              </button>
              <button
                onClick={generateWarehouseExcel}
                className="btn btn-export"
              >
                <FiDownload /> Exportar a Excel
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading">Cargando reporte de bodegas...</div>
          ) : warehouseData && warehouseData.warehouses.length > 0 ? (
            <div className="warehouse-report">
              <div className="warehouse-summary" style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h3>Resumen General</h3>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Inventario Total: {warehouseData.total_inventory} unidades</p>
              </div>

              {warehouseData.warehouses.map((warehouse, index) => (
                <div key={warehouse.id} className="warehouse-section" style={{ marginBottom: '40px', padding: '20px', border: '1px solid #dee2e6', borderRadius: '8px' }}>
                  <h3 style={{ color: '#2980b9', marginBottom: '10px' }}>
                    {warehouse.nombre} - {warehouse.percentage}% del inventario total
                  </h3>
                  <p style={{ color: '#666', marginBottom: '20px' }}>
                    Ubicaci\u00f3n: {warehouse.ubicacion} | Total: {warehouse.total_items} unidades
                  </p>

                  {/* Bar Chart */}
                  <div style={{ marginBottom: '20px' }} id={`warehouse-chart-${warehouse.id}`}>
                    <h4>Distribuci\u00f3n por Categor\u00eda</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={warehouse.categories.filter(cat => cat.cantidad > 0)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="categoria"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          interval={0}
                        />
                        <YAxis label={{ value: 'Cantidad', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === 'cantidad') {
                              const category = warehouse.categories.find(cat => cat.cantidad === value);
                              return [`${value} unidades (${category?.percentage || 0}%)`, 'Cantidad'];
                            }
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="cantidad" fill="#2980b9" name="Cantidad">
                          {warehouse.categories.filter(cat => cat.cantidad > 0).map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={`hsl(${210 + idx * 30}, 70%, 50%)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Table */}
                  <div className="category-table">
                    <table className="table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Categor\u00eda</th>
                          <th>Cantidad</th>
                          <th>Porcentaje en Bodega</th>
                        </tr>
                      </thead>
                      <tbody>
                        {warehouse.categories
                          .filter(cat => cat.cantidad > 0)
                          .map((category, catIndex) => (
                            <tr key={catIndex}>
                              <td>{category.categoria}</td>
                              <td>{category.cantidad}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <div style={{
                                    width: '100px',
                                    height: '20px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '10px',
                                    marginRight: '10px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      width: `${category.percentage}%`,
                                      height: '100%',
                                      backgroundColor: '#2980b9',
                                      transition: 'width 0.3s ease'
                                    }}></div>
                                  </div>
                                  <span>{category.percentage}%</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-items">No se encontraron datos de inventario.</div>
          )}
        </>
      ) : activeTab === 'maintenance' ? (
        <>
          <h2>Reporte de Mantenimiento - Mobiliario</h2>
          <p>Mostrando mobiliario en mantenimiento o con actividad de mantenimiento en los últimos 30 días.</p>

          <div className="report-actions" style={{ margin: '20px 0' }}>
            <button
              onClick={generateMaintenancePDF}
              className="btn btn-export"
              disabled={maintenanceItems.length === 0}
            >
              <FiDownload /> Exportar a PDF
            </button>
            <button
              onClick={() => generateExcel('maintenance')}
              className="btn btn-export"
              disabled={maintenanceItems.length === 0}
            >
              <FiDownload /> Exportar a Excel
            </button>
          </div>

          {loading && activeTab === 'maintenance' ? (
            <div className="loading">Cargando reporte de mantenimiento...</div>
          ) : maintenanceItems.length > 0 ? (
            <div className="maintenance-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                    <th>Bodega</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceItems.map((item, index) => (
                    <tr key={`${item.id}-${index}`}>
                      <td>{item.categoria}</td>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad_en_mantenimiento}</td>
                      <td>
                        <span className={`status-badge ${item.estado === 'En Mantenimiento' ? 'status-in-maintenance' : item.estado === 'Ingresó a Mantenimiento' ? 'status-entered' : 'status-exited'}`}>
                          {item.estado}
                        </span>
                      </td>
                      <td>{item.bodega_nombre || 'No especificada'}</td>
                      <td>{item.fecha ? new Date(item.fecha).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-items">No se encontraron registros de mantenimiento.</div>
          )}
        </>
      ) : activeTab === 'analysis' ? (
        <>
          <h2>Análisis de Eventos por Período</h2>
          <p>Visualización de eventos agrupados por períodos de tiempo con porcentajes relativos.</p>

          <div className="report-controls" style={{ marginBottom: '20px' }}>
            <label htmlFor="period-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>Seleccionar período:</label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="form-select"
              style={{ width: '200px', padding: '8px' }}
            >
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </div>

          {eventAnalysisData && (
            <div className="report-actions" style={{ margin: '20px 0' }}>
              <button
                onClick={generateEventAnalysisPDF}
                className="btn btn-export"
                disabled={!eventAnalysisData || eventAnalysisData.periods.length === 0}
              >
                <FiDownload /> Exportar a PDF
              </button>
              <button
                onClick={() => generateExcel('analysis')}
                className="btn btn-export"
                disabled={!eventAnalysisData || eventAnalysisData.periods.length === 0}
              >
                <FiDownload /> Exportar a Excel
              </button>
            </div>
          )}

          {loading && activeTab === 'analysis' ? (
            <div className="loading">Cargando análisis de eventos...</div>
          ) : eventAnalysisData && eventAnalysisData.periods.length > 0 ? (
            <div className="analysis-report">
              <div className="analysis-summary" style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h3>Resumen General</h3>
                <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Total de eventos: {eventAnalysisData.total_events}</p>
                <p>Período con más eventos: <strong>{eventAnalysisData.periods.reduce((max, p) => p.count > max.count ? p : max, eventAnalysisData.periods[0]).period}</strong> ({eventAnalysisData.periods.reduce((max, p) => p.count > max.count ? p : max, eventAnalysisData.periods[0]).count} eventos)</p>
              </div>

              {/* Bar Chart */}
              <div style={{ marginBottom: '30px' }} id="event-analysis-chart">
                <h3>Distribución de Eventos por Período</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={eventAnalysisData.periods}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="period"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis label={{ value: 'Cantidad de Eventos', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === 'count') {
                          const period = eventAnalysisData.periods.find(p => p.count === value);
                          return [`${value} eventos (${period?.percentage || 0}%)`, 'Cantidad'];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#2980b9" name="Cantidad de Eventos">
                      {eventAnalysisData.periods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${210 + index * 25}, 70%, 50%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Periods Table */}
              <div className="periods-table">
                <h3>Desglose por Período</h3>
                <table className="table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Período</th>
                      <th>Cantidad de Eventos</th>
                      <th>Porcentaje</th>
                      <th>Visualización</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventAnalysisData.periods.map((period, index) => (
                      <tr key={index}>
                        <td><strong>{period.period}</strong></td>
                        <td>{period.count}</td>
                        <td>{period.percentage}%</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              width: '200px',
                              height: '25px',
                              backgroundColor: '#e0e0e0',
                              borderRadius: '5px',
                              marginRight: '10px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${period.percentage}%`,
                                height: '100%',
                                backgroundColor: '#2980b9',
                                transition: 'width 0.3s ease'
                              }}></div>
                            </div>
                            <span style={{ fontWeight: 'bold' }}>{period.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="no-items">No se encontraron eventos para analizar.</div>
          )}
        </>
      ) : activeTab === 'tastings' ? (
        <>
          <h2>Reporte de Degustaciones</h2>
          <p>Consulta y exporta las degustaciones programadas por mes y año.</p>

          <div className="report-controls" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="form-select"
                style={{ width: '150px' }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('es-ES', { month: 'long' })}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-control"
                style={{ width: '100px' }}
              />
              <button
                onClick={fetchTastings}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {tastings.length > 0 && (
            <div className="report-actions">
              <button onClick={generateTastingsPDF} className="btn btn-export">
                <FiDownload /> Exportar Lista a PDF
              </button>
              <button onClick={() => generateExcel('tastings')} className="btn btn-export">
                <FiDownload /> Exportar Lista a Excel
              </button>
              {selectedTasting && (
                <>
                  <button onClick={generateSingleTastingPDF} className="btn btn-export" style={{ backgroundColor: '#2ecc71', borderColor: '#27ae60' }}>
                    <FiDownload /> Exportar Degustación PDF
                  </button>
                  <button onClick={generateSingleTastingExcel} className="btn btn-export" style={{ backgroundColor: '#2ecc71', borderColor: '#27ae60' }}>
                    <FiDownload /> Exportar Degustación Excel
                  </button>
                </>
              )}
            </div>
          )}

          {loading ? (
            <div className="loading">Cargando degustaciones...</div>
          ) : tastings.length > 0 ? (
            <div className="tastings-table">
              <p className="instruction-text" style={{ fontStyle: 'italic', color: '#666', marginBottom: '10px' }}>
                * Haga clic en una degustación para seleccionarla y ver opciones de exportación detallada.
              </p>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Responsable</th>
                    <th>Alimentos</th>
                  </tr>
                </thead>
                <tbody>
                  {tastings.map(tasting => (
                    <tr
                      key={tasting.id}
                      onClick={() => setSelectedTasting(tasting)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: selectedTasting?.id === tasting.id ? '#e8f4f8' : 'inherit',
                        borderLeft: selectedTasting?.id === tasting.id ? '4px solid #3498db' : 'none'
                      }}
                    >
                      <td>{tasting.nombre}</td>
                      <td>{new Date(tasting.fecha_degustacion).toLocaleDateString()}</td>
                      <td>{tasting.hora_degustacion}</td>
                      <td>{tasting.responsable}</td>
                      <td>{tasting.alimentos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-items">No se encontraron degustaciones para el período seleccionado.</div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default Reports;
