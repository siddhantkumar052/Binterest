import { useQuery } from "@apollo/client";
import React from "react";
import queries from "../queries";
import ImagePost from "./ImagePost";

export default function Posts() {
  const { loading, error, data, refetch } = useQuery(queries.USER_POSTED, {
    fetchPolicy: "cache-and-network",
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :</p>;

  return (
    <>
      <a href="/new-post">
        <span>Upload a post</span>{" "}
      </a>

      {data.userPostedImages !== null ? (
        data.userPostedImages.map((k, v) => {
          return <ImagePost k={k} />;
        })
      ) : (
        <div />
      )}
    </>
  );
}
