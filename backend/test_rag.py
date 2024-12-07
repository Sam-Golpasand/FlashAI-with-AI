from query_data import find_new_topic, random_topics

EVAL_PROMPT = """
Expected Response: {expected_response}
Actual Response: {actual_response}
---
(Answer with 'true' or 'false') Does the actual response match the expected response? 
"""



def main():
    rtopic, rsource = random_topics()
    print(rtopic)
    print(rsource)
    ntopic, nsource = find_new_topic(rtopic)
    print(ntopic,nsource)

if __name__ == "__main__":
    main()