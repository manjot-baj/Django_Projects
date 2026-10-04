import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import * as serviceWorker from "./serviceWorker";
import { SnackbarProvider } from "notistack";
import { BrowserRouter } from "react-router-dom";



const phone = window.innerWidth <= 350 || "orientation" in window;

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SnackbarProvider maxSnack={phone ? 1 : 3} dense={phone} preventDuplicate>
      <App />
    </SnackbarProvider>
  </BrowserRouter>,
);

serviceWorker.unregister();
