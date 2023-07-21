import logo from "./logo.svg";
import "./App.css";

import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
} from "react-router-dom";

import React from "react";
import Bin from "./components/Bin";
import NewPost from "./components/NewPost";
import Posts from "./components/Posts";
import Home from "./components/Home";
import Popularity from "./components/Popularity";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/bin",
      element: <Bin />,
    },
    {
      path: "/my-posts",
      element: <Posts />,
    },
    {
      path: "/new-post",
      element: <NewPost />,
    },
    {
      path: "/popularity",
      element: <Popularity />,
    },
  ]);

  return (
    <div className="App">
      <nav>
        <ul>
          <a href="/">
            <li>Home</li>
          </a>
          <span> | </span>
          <a href="/bin">
            <li>Bin</li>
          </a>{" "}
          <span> | </span>
          <a href="/my-posts">
            <li>My Posts</li>
          </a>
        </ul>
      </nav>

      <RouterProvider router={router} />
    </div>
  );
}

export default App;
