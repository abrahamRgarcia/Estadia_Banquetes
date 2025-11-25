import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Inventory from "./pages/Inventory";
import TipoEventoCRUD from "./pages/TipoEventoCRUD";
import Bodegas from "./pages/Bodegas";
import Clientes from "./pages/Clientes";
import Items from "./pages/Items";
import Sillas from "./pages/Sillas";
import Mesas from "./pages/Mesas";
import Manteleria from "./pages/Manteleria";
import Cubierto from "./pages/Cubierto";
import Loza from "./pages/Loza";
import UserCRUD from "./pages/UserCRUD";
import SalasLounge from "./pages/SalasLounge";
import Periqueras from "./pages/Periqueras";
import Carpas from "./pages/Carpas";
import PistasTarimas from "./pages/PistasTarimas";
import Extras from "./pages/Extras";
import Cristaleria from "./pages/Cristaleria";
import ProtectedRoute from "./components/ProtectedRoute";
import Eventos from "./pages/Eventos";
import EventoForm from "./components/EventoForm";
import Degustaciones from "./pages/Degustaciones";
import DegustacionForm from "./components/DegustacionForm";
import Products from "./pages/Products";
import ProductForm from "./components/ProductForm";
import Calendario from "./pages/Calendario";
import Reports from "./components/Reports";
import Notifications from "./pages/Notifications";
import BackupPage from "./pages/BackupPage";
import Invitaciones from "./pages/Invitaciones";
import InvitacionBoda from "./pages/InvitacionBoda";
import HomeConfig from "./pages/HomeConfig";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/tipos-evento"
          element={
            <ProtectedRoute>
              <TipoEventoCRUD />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/bodegas"
          element={
            <ProtectedRoute>
              <Bodegas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/items"
          element={
            <ProtectedRoute>
              <Items />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/sillas"
          element={
            <ProtectedRoute>
              <Sillas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/mesas"
          element={
            <ProtectedRoute>
              <Mesas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/manteleria"
          element={
            <ProtectedRoute>
              <Manteleria />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory/cubierto"
          element={
            <ProtectedRoute>
              <Cubierto />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/loza"
          element={
            <ProtectedRoute>
              <Loza />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/cristaleria"
          element={
            <ProtectedRoute>
              <Cristaleria />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/salas-lounge"
          element={
            <ProtectedRoute>
              <SalasLounge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/periqueras"
          element={
            <ProtectedRoute>
              <Periqueras />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/carpas"
          element={
            <ProtectedRoute>
              <Carpas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/pistas-tarimas"
          element={
            <ProtectedRoute>
              <PistasTarimas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/extras"
          element={
            <ProtectedRoute>
              <Extras />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/users"
          element={
            <ProtectedRoute>
              <UserCRUD />
            </ProtectedRoute>
          }
        />
        {/* Rutas para Eventos */}
        <Route
          path="/inventory/eventos"
          element={
            <ProtectedRoute>
              <Eventos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/eventos/new"
          element={
            <ProtectedRoute>
              <EventoForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/eventos/:id"
          element={
            <ProtectedRoute>
              <EventoForm />
            </ProtectedRoute>
          }
        />
        {/* Rutas para Degustaciones */}
        <Route
          path="/inventory/degustaciones"
          element={
            <ProtectedRoute>
              <Degustaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/degustaciones/new"
          element={
            <ProtectedRoute>
              <DegustacionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/degustaciones/:id"
          element={
            <ProtectedRoute>
              <DegustacionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/products/new"
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/products/:id"
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/calendar"
          element={
            <ProtectedRoute>
              <Calendario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/backup"
          element={
            <ProtectedRoute>
              <BackupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/invitaciones"
          element={
            <ProtectedRoute>
              <Invitaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/invitaciones/:id"
          element={
            <ProtectedRoute>
              <InvitacionBoda />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/home-config"
          element={
            <ProtectedRoute>
              <HomeConfig />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
