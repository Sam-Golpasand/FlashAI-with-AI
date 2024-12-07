def split_output(output: str):
    '''
    splits output into question and answer
    '''
    try:
        cards = output.split("\n")
        cards = cards[0:len(cards)-1:]
        qa = list(map(lambda x: x.split(" || "), cards))
        
        # Validate that we have matching questions and answers
        if not all(len(card) == 2 for card in qa):
            raise ValueError("Mismatched questions and answers")
        
        question = [q.strip() for q, _ in qa]
        answer = [a.strip() for _, a in qa]
        
        return question, answer
    except Exception as e:
        print(f"Error splitting output: {e}")
        return [], []