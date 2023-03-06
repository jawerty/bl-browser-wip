# run file when browser loads
import json
import glob
import os
# clear context embeddings
with open('./qa-engine/data/context_embeddings.json', 'w+', encoding='utf-8') as f:
    json.dump({
        "embeddings": []
    }, f, ensure_ascii=False, indent=4)


# clear context embeddings

for path in glob.glob("./qa-engine/data/link_query_context_embeddings*.json"):
    os.remove(path)

with open('./qa-engine/data/link_query_context_embeddings_0.json', 'w+', encoding='utf-8') as f:
    json.dump({
        "embeddings": []
    }, f, ensure_ascii=False, indent=4)

print("finished qa init")