"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { TarotCards } from "./Cards";
import Lenis from "lenis";

import { TypingText } from "@/components/animate-ui/text/typing";
import { sendMessage } from "../actions/ai";

const SYSTEM_PROMPT = `You are a mystical tarot reader. 
Always respond in the tone of a streetwise oracle who explains mystical tarot wisdom in modern English. 
Be concise, vivid, and a bit dramatic.`;

export default function CardBrowser() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>(
    new Array(TarotCards.length).fill(null)
  );
  const [selectedCard, setSelectedCard] = useState<
    (typeof TarotCards)[0] | null
  >(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const l = new Lenis({
      duration: 1.2,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    });
    function raf(time: number) {
      l.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    setLenis(l);
    return () => l.destroy();
  }, []);

  const scrollToCard = (index: number) => {
    if (!lenis || !cardRefs.current[index]) return;
    const top = cardRefs.current[index]!.offsetTop;
    lenis.scrollTo(top);

    setMessages(["🔮 is typing..."]);
    setSelectedCard(TarotCards[index]);

    generateTarotMessage(TarotCards[index]);
  };

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
      <div
        ref={containerRef}
        className={`relative h-[${
          TarotCards.length * 100
        }vh] flex flex-col items-center justify-center `}
      >
        {TarotCards.map((card, i) => {
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
              className="sticky top-0 z-10 flex items-center justify-center h-screen cursor-pointer"
              onClick={() => scrollToCard(i)}
              ref={(el: HTMLDivElement | null) => {
                if (cardRefs.current) cardRefs.current[i] = el;
              }}
            >
              <div className="relative w-75 h-130 rounded-2xl overflow-hidden border-4 border-red-600">
                <Image
                  src={card.image}
                  alt={card.name}
                  fill
                  className="object-cover rounded-2xl"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="fixed bottom-4 left-0  px-4 z-50t text-md lg:text-xl">
        {messages.map((m, i) => (
          <TypingText
            text={m}
            key={i}
            className={`shadow-sm mb-2 font-bold bg-black  ${
              m.startsWith("You:") ? "text-lime-500" : "text-white"
            }`}
          />
        ))}
      </div>
    </>
  );
}
