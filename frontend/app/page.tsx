"use client";

import React, { useState, useEffect } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { DeckForm } from "@/components/DeckForm";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Card {
  question: string;
  answer: string;
}

interface ApiResponse {
  cards: Card[];
}

export default function Index(): JSX.Element {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [deckName, setDeckName] = useState<string>("");
  const [deckAmount, setDeckAmount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize Supabase client on the client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const client = createClient();
      setSupabase(client);
    }
  }, []);

  const handleFileUpload = (uploadedFiles: File[]): void => {
    setFiles(uploadedFiles);
  };

  const handleClear = (): void => {
    setFiles([]);
    setResponse(null);
    setDeckName("");
    setDeckAmount(1);
    toast.info("Form cleared");
  };

  const handleDeckFormSubmit = (name: string, amount: number): void => {
    setDeckName(name);
    setDeckAmount(amount);
    handleGenerate(name, amount);
  };

  const handleGenerate = async (deckName: string, deckAmount: number): Promise<void> => {
    if (files.length === 0) {
      toast.error("Please upload files first");
      return;
    }

    if (!supabase) {
      toast.error("Supabase client not initialized");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("deckAmount", deckAmount.toString());

    try {
      // Upload files to your API endpoint
      const res = await fetch("http://localhost:3011/file-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("File upload failed");
      }

      const data: ApiResponse = await res.json();
      setResponse(data);

      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Insert deck into database
      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .insert([{ title: deckName, user_id: user.id }])
        .select()
        .single();

      if (deckError || !deck) {
        throw new Error(deckError?.message || "Failed to create deck");
      }

      // Map cards to include the deck_id and insert them
      const cards = data.cards.map((card) => ({
        deck_id: deck.id,
        front: card.question,
        back: card.answer,
      }));

      const { error: cardsError } = await supabase.from("cards").insert(cards);
      if (cardsError) {
        throw new Error(cardsError.message || "Failed to create cards");
      }

      toast.success("Deck and cards created successfully");
      router.replace(`/decks/`);
    } catch (error) {
      console.error("Error:", error);
      toast.error((error as Error).message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-3xl font-bold text-center">Create Deck</h1>
        <FileUpload onChange={handleFileUpload} />
        <DeckForm onSubmit={handleDeckFormSubmit} isLoading={loading} />
      </div>
    </div>
  );
}
