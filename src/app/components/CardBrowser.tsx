"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import Lenis from "lenis";
import { TarotCards } from "./Cards";
import { sendMessage } from "../actions/ai";
import { TypingText } from "@/components/animate-ui/text/typing";

const SYSTEM_PROMPT = `You are a mystical tarot reader. 
Always respond in the tone of a streetwise oracle who explains mystical tarot wisdom in modern Swedish. 
Be concise, vivid, and a bit dramatic. But maximum 3 sentences and no **`;

function FlippingCard({
  onReveal,
  onHide,
}: {
  onReveal: (card: (typeof TarotCards)[0]) => void;
  onHide: () => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontCard, setFrontCard] = useState<(typeof TarotCards)[0] | null>(
    null
  );

  const handleClick = () => {
    if (!isFlipped) {
      const randomCard =
        TarotCards[Math.floor(Math.random() * TarotCards.length)];
      setFrontCard(randomCard);
      setIsFlipped(true);
      onReveal(randomCard);
    } else {
      setIsFlipped(false);
      setFrontCard(null);
      onHide();
    }
  };

  return (
    <motion.div
      style={{ width: 300, height: 500, perspective: 1000 }}
      onClick={handleClick}
      className="cursor-pointer"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Back */}
        <motion.div
          style={{
            position: "absolute",
            backfaceVisibility: "hidden",
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            src="/images/tarot-back-3.png"
            alt="tarot-back"
            fill
            className="object-cover rounded-2xl border-6 border-blue-900"
          />
        </motion.div>

        {/* Front */}
        <motion.div
          style={{
            position: "absolute",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            width: "100%",
            height: "100%",
          }}
        >
          {frontCard && (
            <Image
              src={frontCard.image}
              alt={frontCard.name}
              fill
              className="object-cover rounded-2xl border-6 border-blue-900"
            />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ProgressBar({
  scrollYProgress,
}: {
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 flex items-center justify-center">
      <motion.div className="h-2 bg-neutral-800 z-50 w-xl rounded-full">
        <motion.div
          className="h-2 bg-blue-800 origin-left rounded-l-full rounded-r-full"
          style={{ scaleX }}
        />
      </motion.div>
    </div>
  );
}

export default function CardBrowser() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      orientation: "vertical",
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Framer Motion scroll hook — always called
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    if (!loading && messages.length === 0) {
      setMessages([
        "Sådärja, skrolla genom kortleken och klicka på ett kort vetja!",
      ]);
    }
  }, [loading]);

  const generateTarotMessage = async (card: (typeof TarotCards)[0]) => {
    const prompt = `${SYSTEM_PROMPT}\n\nThe user has drawn "${card.name}". 
Comment on the ${card.description}. Translate it to modern Swedish and make it in 3-4 sentences like you were born and raised in the streets of Södermalm. And never use ** and at the end of your message, instruct the user to draw a new card`;

    setLoading(true);
    setMessages([``]);

    try {
      const response = await sendMessage(
        [{ role: "user", parts: [{ text: prompt }] }],
        prompt
      );
      setMessages([`Tarot-göken: ${response}`]);
    } catch {
      setMessages(["⚠️ Nåt gick snett."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProgressBar scrollYProgress={scrollYProgress} />
      <div
        ref={containerRef}
        style={{ height: `${TarotCards.length * 100}vh` }}
        className="relative flex flex-col items-center justify-center z-0"
      >
        {TarotCards.map((_, i) => {
          const start = i / TarotCards.length;
          const end = (i + 1) / TarotCards.length;

          const scale = useTransform(
            scrollYProgress,
            [start, (start + end) / 2, end],
            [0.85, 1.05, 0.85]
          );
          const rotate = useTransform(
            scrollYProgress,
            [start, (start + end) / 2, end],
            [-5, 0, 5]
          );

          return (
            <motion.div
              key={i}
              style={{ scale, rotate }}
              className="sticky top-0 z-10 flex items-center justify-center h-screen"
            >
              <FlippingCard
                onReveal={generateTarotMessage}
                onHide={() => {
                  setMessages([]);
                  setLoading(false);
                }}
              />
            </motion.div>
          );
        })}
      </div>

      <div className="fixed top-4 left-0 flex flex-col items-center justify-center px-4 z-50 lg:text-xl w-full leading-tight">
        {messages.map((m, i) => (
          <TypingText
            key={i}
            text={m}
            className="shadow-sm mb-2 font-bold bg-white w-md lg:w-xl"
          />
        ))}
        {loading && (
          <div className="shadow-sm mb-2 font-bold bg-white w-md lg:w-xl">
            Tarot-Göken funderar...
          </div>
        )}
      </div>
    </>
  );
}
