import { Outlet } from "react-router-dom";
import CustomerNavBar from "../components/CustomerNavBar";
import Footer from "../components/Footer";

const CustomerLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-neutral1 text-zinc-900">
      <CustomerNavBar />
      <main className="grow pb-16 pt-36 lg:pt-24">
        <Outlet />
      </main>
      <Footer productsTo="/shop" cartTo="/account/cart" ordersTo="/account/orders" />
    </div>
  );
};

export default CustomerLayout;
