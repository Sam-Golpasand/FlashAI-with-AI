import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import FloatingLabelInput from "@/components/FloatingLabelInput";

interface DeckFormProps {
  onSubmit: (deckName: string, deckAmount: number) => void;
  isLoading: boolean;
}

export function DeckForm({ onSubmit, isLoading }: DeckFormProps) {
  const [deckName, setDeckName] = useState<string>("");
  const [deckAmount, setDeckAmount] = useState<number>(1); // Initialize with a valid default

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName || deckAmount <= 0) {
      alert("Please provide valid inputs."); // Basic validation check
      return;
    }
    onSubmit(deckName, deckAmount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Deck Name Input */}
      <FloatingLabelInput 
        value={deckName} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeckName(e.target.value)} 
        label="Deck Name" 
        id="deckName" 
        className="w-full"
        required
      />
      {/* Deck Amount Input */}
      <input 
        type="number" 
        value={deckAmount.toString()} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const value = parseInt(e.target.value, 10);
          setDeckAmount(Number.isNaN(value) ? 1 : value); // Handle invalid or empty inputs
        }} 
        id="deckAmount" 
        className="w-full bg-[#282831] text-white p-4 rounded-lg"
        required
        min="1"
      />
      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Generating..." : "Generate"}
      </Button>
    </form>
  );
}
