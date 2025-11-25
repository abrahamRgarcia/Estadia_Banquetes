import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN } from '../constants';
import NavbarInventory from '../components/NavbarInventory';
import '../styles/Inventory.css';
import {
  LayoutGrid, Users, Warehouse, GlassWater, Calendar,
  ClipboardList, Utensils, Box, Settings, BarChart,
  Mail, FileText, Building, UsersRound, Star, Tent,
  ClipboardPlus, HandPlatter, Palmtree, Speaker, CakeSlice
} from 'lucide-react';

// Estructura de datos para las tarjetas de acción
const actionItems = [
  { to: "/inventory/eventos", icon: Calendar, label: "Eventos" },
  { to: "/inventory/clientes", icon: Users, label: "Clientes" },
  { to: "/inventory/products", icon: LayoutGrid, label: "Productos" },
  { to: "/inventory/items", icon: Box, label: "Inventario" },
  { to: "/inventory/bodegas", icon: Warehouse, label: "Bodegas" },
  { to: "/inventory/degustaciones", icon: HandPlatter, label: "Degustaciones" },
  { to: "/inventory/tipos-evento", icon: Star, label: "Tipos de Evento" },
  { to: "/inventory/users", icon: UsersRound, label: "Usuarios" },
  { to: "/inventory/reports", icon: BarChart, label: "Reportes" },
  { to: "/inventory/backup", icon: FileText, label: "Respaldos" },
  { to: "/inventory/home-config", icon: LayoutGrid, label: "Página de Inicio" },
];

const Inventory = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  return (
    <div className="inventory-page">
      <NavbarInventory />
      <main className="inventory-main-content">
        <header className="inventory-header">
          <h1>Panel de Control</h1>
          <p>Bienvenido, {username}. Gestiona todos los aspectos de tu negocio desde aquí.</p>
        </header>
        <div className="actions-grid">
          {actionItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link to={item.to} key={index} className="action-card">
                <Icon className="action-card-icon" size={36} strokeWidth={1.5} />
                <span className="action-card-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Inventory;
