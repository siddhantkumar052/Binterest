import { useQuery } from "@apollo/client";
import React from "react";
import queries from "../queries";
import ImagePost from "./ImagePost";

export default function Bin() {
  const { loading, error, data, refetch } = useQuery(queries.BINNED, {
    fetchPolicy: "cache-and-network",
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <>
      {data.binnedImages !== null ? (
        data.binnedImages.map((k, v) => {
          return <ImagePost k={k} />;
        })
      ) : (
        <div />
      )}
    </>
  );
}
