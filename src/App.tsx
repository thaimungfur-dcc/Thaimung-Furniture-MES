import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Planning from './pages/Planning';
import Production from './pages/Production';
import UserPermissions from './pages/UserPermissions';
import MasterCodes from './pages/MasterCodes';
import ItemMaster from './pages/ItemMaster';
import SalesOrder from './pages/SalesOrder';
import ProductCatalogue from './pages/ProductCatalogue';
import QCInspectionStandards from './pages/QCInspectionStandards';
import FGAnalytics from './pages/FGAnalytics';
import RMAnalytics from './pages/RMAnalytics';
import WarehouseBooking from './pages/WarehouseBooking';
import MRP from './pages/MRP';
import BOMManagement from './pages/BOMManagement';
import PurchaseRequisition from './pages/PurchaseRequisition';
import PurchaseOrder from './pages/PurchaseOrder';
import PRAnalysis from './pages/PRAnalysis';
import POAnalysis from './pages/POAnalysis';
import WarehouseOut from './pages/WarehouseOut';
import WarehouseIn from './pages/WarehouseIn';
import CustomerManagement from './pages/CustomerManagement';
import FabricDesign from './pages/FabricDesign';
import CashFlow from './pages/CashFlow';
import StockCard from './pages/StockCard';
import InventoryPlan from './pages/InventoryPlan';
import PlaceholderPage from './pages/PlaceholderPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Tier 3: Login (Public but only if not authenticated) */}
          <Route path="/login" element={<Login />} />

          {/* Main Layout */}
          <Route element={<Layout />}>
            {/* Tier 2: Home (Guest Access Allowed) */}
            <Route path="/" element={<Home />} />

            {/* Sales */}
            <Route path="/sales/catalogue" element={<ProductCatalogue />} />
            <Route path="/sales/orders" element={<SalesOrder />} />
            <Route path="/sales/analysis" element={<PlaceholderPage title="Sales Analysis" />} />
            <Route path="/sales/customer" element={<CustomerManagement />} />
            <Route path="/sales/calendar" element={<PlaceholderPage title="Sales Calendar" />} />

            {/* Warehouse */}
            <Route path="/warehouse/outbound" element={<WarehouseOut />} />
            <Route path="/warehouse/inbound" element={<WarehouseIn />} />
            <Route path="/warehouse/fg-analytics" element={<FGAnalytics />} />
            <Route path="/warehouse/rm-analytics" element={<RMAnalytics />} />
            <Route path="/warehouse/booking" element={<WarehouseBooking />} />
            <Route path="/warehouse/planning" element={<InventoryPlan />} />
            <Route path="/warehouse/stock-card" element={<StockCard />} />
            <Route path="/warehouse/logistics" element={<PlaceholderPage title="Logistics" />} />
            <Route path="/warehouse/returns" element={<PlaceholderPage title="Return Goods" />} />
            <Route path="/warehouse/calendar" element={<PlaceholderPage title="Warehouse Calendar" />} />

            {/* Procurement */}
            <Route path="/procurement/pr" element={<PurchaseRequisition />} />
            <Route path="/procurement/po" element={<PurchaseOrder />} />
            <Route path="/procurement/pr-analysis" element={<PRAnalysis />} />
            <Route path="/procurement/po-analysis" element={<POAnalysis />} />
            <Route path="/procurement/history" element={<PlaceholderPage title="Purchase History" />} />
            <Route path="/procurement/supplier" element={<PlaceholderPage title="Supplier Management" />} />
            <Route path="/procurement/debt" element={<PlaceholderPage title="Debt Management" />} />

            {/* Planning */}
            <Route 
              path="/planning" 
              element={
                <ProtectedRoute permission="planning">
                  <Planning />
                </ProtectedRoute>
              } 
            />
            <Route path="/planning/mrp" element={<MRP />} />
            <Route path="/planning/mat-requirement" element={<PlaceholderPage title="Material Requirement" />} />
            <Route path="/planning/schedule" element={<PlaceholderPage title="Production Schedule" />} />

            {/* Production */}
            <Route 
              path="/production" 
              element={
                <ProtectedRoute permission="production">
                  <Production />
                </ProtectedRoute>
              } 
            />
            <Route path="/production/report" element={<PlaceholderPage title="Production Report" />} />

            {/* QC */}
            <Route path="/qc/spec" element={<QCInspectionStandards />} />
            <Route path="/qc/nc-control" element={<PlaceholderPage title="NC Control" />} />

            {/* Finance */}
            <Route path="/finance/cash-flow" element={<CashFlow />} />
            <Route path="/finance/income" element={<PlaceholderPage title="Income" />} />
            <Route path="/finance/expense" element={<PlaceholderPage title="Expense" />} />
            <Route path="/finance/summary" element={<PlaceholderPage title="Financial Summary" />} />

            {/* Cost Control */}
            <Route path="/cost/product-cost" element={<PlaceholderPage title="Product Cost" />} />
            <Route path="/cost/analysis" element={<PlaceholderPage title="Cost Analysis" />} />
            <Route path="/cost/bom" element={<BOMManagement />} />

            {/* Master Data */}
            <Route 
              path="/master/codes" 
              element={
                <ProtectedRoute permission="master">
                  <MasterCodes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/master/items" 
              element={
                <ProtectedRoute permission="master">
                  <ItemMaster />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/master/fabric-design" 
              element={
                <ProtectedRoute permission="master">
                  <FabricDesign />
                </ProtectedRoute>
              } 
            />

            {/* Calendar */}
            <Route path="/calendar" element={<PlaceholderPage title="MES Calendar" />} />

            {/* Settings */}
            <Route 
              path="/settings/permissions" 
              element={
                <ProtectedRoute permission="all">
                  <UserPermissions />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
