"use client";

import { useState } from "react";
import CardBrowser from "./CardBrowser";

export default function Tarot() {
  const [startGame, setStartGame] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStartGame(true);
    }, 1800); // simulate shuffle/loading
  };

  return (
    <>
      {!startGame ? (
        <div className="w-full min-h-screen flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl font-bold mb-4">Tarot</h1>
          <p>
            Välkommen in till Tarot-göken! Ta't lugnt så ska jag bara blanda
            korten
          </p>
          <button
            className="p-4 bg-white text-black font-bold cursor-pointer mt-4"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Blandar korten..." : "Sätt igång"}
          </button>
        </div>
      ) : (
        <CardBrowser />
      )}
    </>
  );
}
