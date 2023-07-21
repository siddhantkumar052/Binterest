import React, { useState } from "react";

import { useQuery } from "@apollo/client";
import queries from "../queries";
import ImagePost from "./ImagePost";
import { ScrollRestoration } from "react-router-dom";

export default function Home() {
  const [pageNum, setPageNum] = useState(1);
  const [images, setImages] = useState([]);
  const [scrollPos, setScrollPos] = useState(0);

  const { loading, error, data, refetch } = useQuery(queries.UNSPLASH, {
    variables: { pageNum },
    fetchPolicy: "cache-and-network",
  });

  function loadMore() {
    setScrollPos(window.scrollY);
    setPageNum(pageNum + 1);
    refetch();
  }
  console.log(data);

  if (
    data !== undefined &&
    data !== null &&
    data.unsplashImages !== undefined
  ) {
    data.unsplashImages.map((k, v) => {
      images.push(k);
    });

    window.scrollTo(0, scrollPos);
  }

  if (error) {
    console.log(error);
  }
  return (
    <>
      {images.map((k, v) => {
        return <ImagePost k={k} key={v} />;
      })}
      {loading ? (
        <span>Loading......</span>
      ) : (
        <button onClick={loadMore}>Load More</button>
      )}
    </>
  );
}
