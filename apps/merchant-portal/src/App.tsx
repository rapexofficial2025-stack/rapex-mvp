import { useState } from "react";
import { Sidebar, Topbar, Button } from "@rapex/ui-web";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
];

function App() {
  const [active, setActive] = useState("dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        title="RAPEX Merchant"
        items={NAV_ITEMS.map((item) => ({ ...item, active: item.key === active, onClick: () => setActive(item.key) }))}
      />
      <div style={{ flex: 1 }}>
        <Topbar title={NAV_ITEMS.find((item) => item.key === active)?.label ?? ""} actions={<Button label="New Order" />} />
      </div>
    </div>
  );
}

export default App;
