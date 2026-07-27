import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store.ts";
import MainRouter from "./Routes/index.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import AuthDialog from "./components/AuthDialog.tsx";

const App = () => (
  <Provider store={store}>
    <PersistGate  persistor={persistor}>
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Sonner />
          <AuthDialog />
          <MainRouter />
        </BrowserRouter>
      </TooltipProvider>
    </PersistGate>
  </Provider>
);

export default App;
