"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import Lenis from "lenis";
import { TarotCards } from "./Cards";
import { sendMessage } from "../actions/ai";
import { TypingText } from "@/components/animate-ui/text/typing";

const SYSTEM_PROMPT = `You are a mystical tarot reader. 
Always respond in the tone of a streetwise oracle who explains mystical tarot wisdom in modern English. 
Be concise, vivid, and a bit dramatic.`;

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
      // Flip to front → reveal a random tarot card
      const randomCard =
        TarotCards[Math.floor(Math.random() * TarotCards.length)];
      setFrontCard(randomCard);
      setIsFlipped(true);
      onReveal(randomCard);
    } else {
      // Flip back → hide and clear AI messages
      setIsFlipped(false);
      setFrontCard(null);
      onHide();
    }
  };

  return (
    <motion.div
      style={{
        width: "300px",
        height: "500px",
        perspective: "1000px",
      }}
      onClick={handleClick}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
        }}
        className="cursor-pointer"
      >
        {/* Back Side */}
        <motion.div
          style={{
            position: "absolute",
            backfaceVisibility: "hidden",
            width: "100%",
            height: "100%",
          }}
        >
          <Image
            src={"/images/tarot-back-3.png"}
            alt="tarot-back"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover rounded-2xl border-6 border-blue-900"
          />
        </motion.div>

        {/* Front Side */}
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
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover rounded-2xl border-6 border-blue-900"
            />
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function ProgressBar() {
  // Track vertical scroll progress (0 → 1)
  const { scrollYProgress, scrollXProgress } = useScroll();
  const [isDesktop, setIsDesktop] = useState(true);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  return (
    <div className="fixed top-0 left-0 right-0 p-4 flex items-center justify-center ">
      <motion.div className=" h-2 bg-blue-100  z-50  w-xl rounded-full">
        <motion.div
          className="h-2 bg-blue-600 origin-left"
          style={{
            scaleX,
          }}
        />
      </motion.div>
    </div>
  );
}

export default function CardBrowser() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  const { scrollYProgress } = useScroll({
    target: containerRef, // ← pass the ref, not current
    offset: ["start start", "end end"],
  });

  const generateTarotMessage = async (card: (typeof TarotCards)[0]) => {
    const prompt = `${SYSTEM_PROMPT}\n\nThe user has drawn "${card.name}". 
    Comment on the ${card.description}. Translate it to modern English in 1 sentence like you were born and raised in the streets.`;

    setLoading(true);
    try {
      const response = await sendMessage(
        [{ role: "user", parts: [{ text: prompt }] }],
        prompt
      );
      setMessages([`🔮 ${response}`]);
    } catch {
      setMessages(["⚠️ Something went wrong with the reading."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProgressBar />
      <div
        ref={containerRef}
        className={`relative h-[${
          TarotCards.length * 100
        }vh] flex flex-col items-center justify-center`}
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

      <div className="fixed bottom-4 left-0 flex flex-col items-center justify-center px-4 z-50 lg:text-xl w-full leading-tight">
        {messages.map((m, i) => (
          <TypingText
            text={m}
            key={i}
            className="shadow-sm mb-2 font-bold bg-black text-white w-md lg:w-xl"
          />
        ))}
        {loading && (
          <div className="shadow-sm mb-2 font-bold bg-black text-white w-md lg:w-xl">
            TarotLady is typing...
          </div>
        )}
      </div>
    </>
  );
}
