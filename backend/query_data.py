import argparse
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import random
from embedding_function import get_embedding_function

CHROMA_PATH = "chroma"
embedding_function = get_embedding_function()
db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)
KEY = "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"


PROMPT_TEMPLATE = """
Instruktion: Lav et præcist spørgsmål ud fra teksten på max 100 tegn. Skriv et kort og præcist svar til spørgsmålet bagefter på max 50 tegn. Svar og spørgsmål skal separeres af ||. 
Eksempel:
Tekst: Brug af smigvinkel (her vist på træ – men princippet er det samme) Vinkelmåler Vinkelmåleren er indstillelig og anvendes til afsætning af diverse vinkler. Nedstryger Brug en nedstryger til at skære i metal. Dens klinge sidder ligesom dekupørsaven og løvsaven i en ramme. Den har imidlertid en dybere klinge, der ikke er beregnet til at skære kurver. En nedstryger har meget fine tænder, og det går altid langsomt at skære gennem metal. Forny klingerne med regelmæssige mellemrum, og sæt altid klingen, så tænderne peger fremad.  
Svar || Spørgsmål: Hvad er forskellen på en Nedstryger og en løvsav? || En nedstryger har en dybere klinge, som er beregnet til at skærer i metal 
Tekst: og rytmen er stadig central, men nu ofte i en langt mere varieret form, hvor digtet udnytter sprogets egen musikalitet og rytme. Drama: Ordet drama kommer af græsk dran, der betyder handling. I dramaet er handling central, som det også er tilfældet i den episke genre, men til forskel fra epik, er dramaet grundlæggende bestemt ved at være tiltænkt en scene, hvor det skal udføres af skuespillere. Fremstillingsformen er dialog og direkte tale. Blandingsgenrer: epikken, lyrikken og dramaet skal vi ikke.
Svar || Spørgsmål: Hvad kendetegner fremstillingsformen af den litterære genre drama? || dialog og direkte tale
Tekst: . Fx vil en blanding af en svag syre og dens korresponderende svage base være god til at modstå pH-ændringer fra tilsatte syrer og baser. Uanset om man tilfører en stærk syre eller en stærk base til blandingen, vil der være noget til at neutralisere det tilsatte, så pH vil ikke ændre sig så meget. Det er vigtigt i mange sammenhænge: Fx må pH i blodet ikke ændre sig mere end 0,1 for ikke at ødelægge noget vigtigt i kroppen. Også i mange industrielle processer skal pH holdes konstant. En blanding af en svag syre og dens korresponderende svage base kaldes en puffer. Eller en buffer eller stødpude
Svar || Spørgsmål: Hvad hedder en blanding af en svag syre og dens korresponderende svage basepar, som kan neutralisere stærke syrer og baser || en puffer 
Tekst:
--- 
{context}

Svar || Spørgsmål:
"""


async def generate_questions(topic_id=None,num_questions=5):
    '''
    input topic id from a question the user didn't answer
    don't input a topic id if you want a random topic
    '''
    s = ""
    l = []
    for _ in range(num_questions):
        if topic_id == None:
            topic_sequence, source  = random_topics()
            response, _ = user_questions(topic_sequence,source)
        else:
            topic_sequence,source = find_new_topic(topic_id)
            response, _ = user_questions(topic_sequence,source)
        s = s + response + "\n"
        l += source
    return s, l

    
        

def find_new_topic(id):
    # Search the DB.
    topic = db.get(ids=id)
    t = topic.get("documents")[0]
    results = db.similarity_search_with_relevance_scores(t, k=1)
    #removes the first topic from the list
    sources = [doc.metadata.get("id", None) for doc, _score in results]
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    return context_text, sources
    

def random_topics():
    # Hent alle ID'er
    all_ids = db.get()["ids"]
    # Vælg n tilfældige ID'er
    sources_random_ids = random.sample(all_ids, 1) 
    # Hent dokumentindhold
    results = db.get(ids=sources_random_ids)
    context_text = "\n\n---\n\n".join(results['documents'])
    return context_text, sources_random_ids
    

def user_questions(context_text,sources):
    """
    Generate a response to the user's question based on given context.
    """
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text)
    model = ChatOpenAI(model="gpt-4o-mini",max_tokens=1000,api_key=KEY)
    response_text = model.invoke(prompt).content
    return response_text, sources



