# run file when browser loads
import json
import argparse
from qa_pipeline import QAPipeline

parser = argparse.ArgumentParser(
                    prog = 'basic query pipeline')

parser.add_argument('query')
parser.add_argument('-l', '--link')  
parser.add_argument('-d', '--depth')  
args = parser.parse_args()

print('starting basic query')
qa = QAPipeline(args.link, args.depth)


# print("loading qa model just in ")
# qa.load_qa_model()


qa.load_context_corpus()

results = qa.basic_search(args.query)
print("BASICQUERY_PIPELINE: " + json.dumps(results))