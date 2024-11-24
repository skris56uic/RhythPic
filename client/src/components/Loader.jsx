import { useContext } from "react";

import { AppContext } from "../AppContextAndAppContextProvider";

import "./Loader.css";

export default function Loader() {
  const { loading } = useContext(AppContext);

  return (
    <>
      <div className="loadercontainer">
        <div className="loader"></div>
        <div className="loadertext">{loading.text}</div>
      </div>
    </>
  );
}
