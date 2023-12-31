import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

import NavBar from "../components/NavBar";
import AudioPlayer from "../components/AudioPlayer";
import "../styles/components/exercise.scss";

function Exercise()
{
  const { id } = useParams();
  const [card, setCard] = useState([]);

  useEffect(() =>
  {
    fetch(
      `https://meditationnotmedication-production.up.railway.app/api/content/${id}`
    )
      .then((res) => res.json())
      .then((data) =>
      {
        setCard(data);
      })
      .catch((err) => console.log(err));
  }, [id]);

  return (
    <>
      <NavBar />
      {card.length === 0 ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="exercise-page">
          <header>
            <a href="/" className="back">
              <h1>Back</h1>
            </a>
          </header>

          <div className="exercise-info">
            <h1>{card[0].content_name}</h1>
            <h3>{card[0].description}</h3>
            <div className="img-wrapper">
              <img src={card[0].image} alt="calming image" />
            </div>
          </div>
          <div className="music-player">
            <AudioPlayer src={card[0].audio} />
          </div>
        </div>
      )}
    </>
  );
}

export default Exercise;
