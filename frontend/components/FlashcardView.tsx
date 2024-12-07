"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Frown, Smile } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Flashcard {
  id: number;
  deck_id: number;
  front: string;
  back: string;
}

export default function FlashcardView() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]); // Initialize as an empty array
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [forgotCount, setForgotCount] = useState(0);

  const params = useParams<{ deckId: string }>();

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    try {
      const supabase = createClient();
      const { data: Cards, error } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", params.deckId);

      if (error) throw error;

      setFlashcards(Cards || []);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  }

  const currentCard = flashcards[currentCardIndex] || null;

  const flipCard = () => setIsFlipped(!isFlipped);

  const nextCard = () => {
    if (flashcards.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (flashcards.length > 0) {
      setCurrentCardIndex(
        (prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length
      );
      setIsFlipped(false);
    }
  };

  const handleRemember = () => {
    setRememberedCount((prev) => prev + 1);
    const updatedFlashcards = flashcards.filter(
      (_, index) => index !== currentCardIndex
    );
    setFlashcards(updatedFlashcards);

    if (updatedFlashcards.length > 0) {
      setCurrentCardIndex((prevIndex) => prevIndex % updatedFlashcards.length);
    } else {
      setCurrentCardIndex(0);
    }
    setIsFlipped(false);
  };

  const handleForgot = () => {
    setForgotCount((prev) => prev + 1);
    const forgottenCard = flashcards[currentCardIndex];
    const updatedFlashcards = flashcards.filter(
      (_, index) => index !== currentCardIndex
    );
    updatedFlashcards.push(forgottenCard);
    setFlashcards(updatedFlashcards);
    setCurrentCardIndex((prevIndex) => prevIndex % updatedFlashcards.length);
    setIsFlipped(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Flashcards</h1>
      <div className="mb-4 flex justify-between items-center">
        <div>
          Card {flashcards.length > 0 ? currentCardIndex + 1 : 0} of{" "}
          {flashcards.length}
        </div>
        <div>
          Remembered: {rememberedCount}, Forgot: {forgotCount}
        </div>
      </div>
      {currentCard ? (
        <Card
          className="mb-6 h-64 flex items-center justify-center cursor-pointer perspective-1000"
          onClick={flipCard}
        >
          <CardContent className="text-center w-full h-full flex items-center justify-center transform transition-transform duration-500">
            {!isFlipped ? (
              <div
                className={`absolute w-full h-full flex items-center justify-center`}
              >
                <p className="text-2xl font-semibold">{currentCard.front}</p>
              </div>
            ) : (
              <div
                className={`absolute w-full h-full flex items-center justify-center`}
              >
                <p className="text-2xl">{currentCard.back}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 h-64 flex items-center justify-center perspective-1000">
          <CardContent className="text-center w-full h-full flex items-center justify-center transform transition-transform duration-500">
            <div className="text-center text-lg font-semibold">
              All cards completed!
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-between items-center">
        {isFlipped ? (
          <div className="flex gap-4">
            <Button
              onClick={handleForgot}
              variant="destructive"
              disabled={flashcards.length === 0}
            >
              <Frown className="mr-2 h-4 w-4" /> Forgot
            </Button>
            <Button
              onClick={handleRemember}
              variant="default"
              disabled={flashcards.length === 0}
            >
              <Smile className="mr-2 h-4 w-4" /> Remember
            </Button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button onClick={flipCard} variant="default" disabled={!currentCard}>
              Flip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
