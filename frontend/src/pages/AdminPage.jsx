import { BarChart, PlusCircle, ShoppingBasket } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import CreateProductForm from "../components/CreateProductForm";
import ProductsList from "../components/ProductsList";
import AnalyticsTab from "../components/AnalyticsTab";

const tabs = [
  { id: "create", label: "Create Product", icon: PlusCircle },
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "analytics", label: "Analytics", icon: BarChart },
];
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("create");
  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900 text-white">
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.h1
          className="text-4xl font-bold mb-8 text-emerald-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Admin Dashboard
        </motion.h1>
        <div className="flex mb-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4  py-2 mx-2 rounded-md transition-colors duration -200 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-fray-700 text-gray-300"
              }`}
            >
              <tab.icon className="mr-2 size-5" />
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "create" && <CreateProductForm />}
        {activeTab === "products" && <ProductsList />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  );
}
