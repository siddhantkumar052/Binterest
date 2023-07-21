import { useQuery } from "@apollo/client";
import React from "react";
import queries from "../queries";
import ImagePost from "./ImagePost";

export default function Popularity() {
  const { loading, error, data } = useQuery(queries.GETTOPBINNED, {
    fetchPolicy: "cache-and-network",
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <>
      {data.getTopTenBinnedPosts !== null ? (
        data.getTopTenBinnedPosts.map((k, v) => {
          return <ImagePost k={k} />;
        })
      ) : (
        <div />
      )}
    </>
  );
}
