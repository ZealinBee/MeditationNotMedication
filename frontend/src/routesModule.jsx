import React from "react";
import { createBrowserRouter } from "react-router-dom";

import Home from "./pages/Home";
import Exercise from "./pages/Exercise";
import Profile from "./pages/Profile";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/exercises/:id",
    element: <Exercise />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/ease",
    element: <div>ease</div>,
  },
]);
