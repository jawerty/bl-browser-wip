# run file when browser loads
import argparse
from qa_pipeline import QAPipeline

parser = argparse.ArgumentParser(
                    prog = 'qa pipeline')

parser.add_argument('question')
parser.add_argument('-l', '--link')  
parser.add_argument('-d', '--depth')  
args = parser.parse_args()

print('starting asking the question')
qa = QAPipeline(args.link, args.depth)


# print("loading qa model just in ")
# qa.load_qa_model()


qa.load_context_corpus()

answer = qa.ask_question(args.question)
print("QAPIPELINE: " + answer)