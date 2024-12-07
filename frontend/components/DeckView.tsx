"use client";

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Book, Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Deck {
  id: number;
  title: string;
  cardCount: number;
}

const supabase = createClient();

export default function DeckView() {
  const [decks, setDecks] = useState<Deck[] | null>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  async function fetchDecks() {
    try {
      // Fetch the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("Error fetching user:", userError);
        setDecks([]);
        return;
      }

      // Fetch decks with card counts
      const { data: decksData, error: deckError } = await supabase
        .from("decks")
        .select(`
          id,
          title,
          user_id,
          cards(deck_id)
        `)
        .eq("user_id", userData.user.id);

      if (deckError) {
        console.error("Error fetching decks:", deckError);
        setDecks([]);
        return;
      }

      // Transform data to include card counts
      const enrichedDecks = decksData?.map((deck: any) => {
        const cardCount = deck.cards?.length || 0;
        return { id: deck.id, title: deck.title, cardCount };
      });

      setDecks(enrichedDecks || []);
    } catch (error) {
      console.error("Unexpected error fetching decks:", error);
      setDecks([]);
    }
  }

  async function deleteDeck(deckId: number) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", deckId);

      if (error) {
        console.error("Error deleting deck:", error);
        return;
      }

      setDecks((prevDecks) => prevDecks ? prevDecks.filter((deck) => deck.id !== deckId) : null);
    } catch (error) {
      console.error("Unexpected error deleting deck:", error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Decks</h1>
        <Link href={"/"}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {decks && decks.map((deck) => (
          <Card
            key={deck.id}
            className="flex flex-col aspect-[2.5/3.5] hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader className="flex-grow flex flex-col justify-center items-center text-center p-2">
              <CardTitle className="text-lg sm:text-xl">{deck.title}</CardTitle>
              <div className="mt-2 text-sm text-muted-foreground">
                <Book className="inline h-4 w-4 mr-1" />
                <span>{deck.cardCount} cards</span>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-center p-2 gap-2">
             <Link href={`/study/${deck.id}`}><Button variant="outline" className="w-full">Study</Button></Link> 
              <Button onClick={() => deleteDeck(deck.id)} variant="destructive" className="w-full">Delete</Button>
            </CardFooter>
          </Card>
        ))}
        {!decks?.length && (
          <div className="text-center text-gray-500 col-span-full">
            No decks found. Create a new one to get started!
          </div>
        )}
      </div>
    </div>
  );
}