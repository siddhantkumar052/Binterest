import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import queries from "../queries";

function ImagePost({ k }) {
  const [mutateFunction, { data, loading, error }] = useMutation(
    queries.UPDATE
  );

  function toggleBin() {
    mutateFunction({
      variables: Object.assign({}, k, { binned: !k.binned }),
    });
  }

  if (data) {
    if (data.updateImage === null) {
      //deleted
      console.log("removed from bin");
    } else {
      console.log("added to bin");
    }
    console.log("data", data);
    console.log("k", k);
  }
  return (
    <>
      <center style={{ margin: "32px" }}>
        <span style={{ color: "#fff" }}> {k.description}</span>
        <br />
        <span style={{ color: "#fff" }}>an image by: {k.posterName}</span>
        <br />
        <img
          src={k.url}
          style={{
            backgroundColor: "#fff",
            padding: "18px",
            width: "400px",
            height: "600px",
          }}
        />
        <br />

        <button onClick={toggleBin}>
          {!k.binned ? <span>Add to Bin </span> : <span>Remove from bin </span>}
        </button>
      </center>
    </>
  );
}

export default ImagePost;
