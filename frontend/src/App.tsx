import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Spinner, Center } from "@chakra-ui/react";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
// import Home from './pages/Home'
// import Menu from './pages/Menu'
// import Recipes from './pages/Recipes'
// import Articles from './pages/Articles'
// import Orders from './pages/Orders'
// import Checkout from './pages/Checkout'
// import Admin from './pages/Admin'

const Home = lazy(() => import("./pages/Home"));
const Menu = lazy(() => import("./pages/Menu"));
const Recipes = lazy(() => import("./pages/Recipes"));
const Articles = lazy(() => import("./pages/Articles"));
const Orders = lazy(() => import("./pages/Orders"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Admin = lazy(() => import("./pages/Admin"));

const PageLoader = () => (
  <Center h="50vh">
    <Spinner size="xl" color="green.500" />
  </Center>
);

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/articles" element={<Articles />} />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
