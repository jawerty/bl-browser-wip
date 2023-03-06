import json
from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline
from sentence_transformers import SentenceTransformer, util
import torch

class QAPipeline:
    def __init__(self, link, depth):
        self.link = link
        self.depth = depth
        self.sentence_model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        self.model_name = "deepset/tinyroberta-squad2"
        self.nlp = pipeline('question-answering', model=self.model_name, tokenizer=self.model_name)
        
        self.contexts = []
        self.contexts_with_embeddings = []
        self.context_embeddings = []

        # load embeddings if they do exist
        self.load_context_embeddings()

    def load_qa_model(self):
        self.model = AutoModelForQuestionAnswering.from_pretrained(self.model_name)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)

    def load_context_corpus(self):
        if self.link:
            context_corpus_file = './qa-engine/data/link_query_context_corpus_'+str(self.depth)+'.json'
        else:
            context_corpus_file = './qa-engine/data/context_corpus.json'
        # get current context corpus
        f = open(context_corpus_file)
        data = json.load(f)

        self.contexts = data["documents"]

        f.close()

        # load embeddings if they don't exist
        if len(self.context_embeddings) == 0:
            print("processing context embeddings")
            # save in the order of the contexts
            self.context_embeddings = [
                self.sentence_model.encode(context['text'], convert_to_tensor=True).tolist() for context in self.contexts
            ]

            self.save_context_embeddings(self.context_embeddings)

    def save_context_embeddings(self, context_embeddings):
        if self.link:
            context_embeddings_file = './qa-engine/data/link_query_context_embeddings_'+str(self.depth)+'.json'
        else:
            context_embeddings_file = './qa-engine/data/context_embeddings.json'


        # get current context corpus
        with open(context_embeddings_file, 'w+', encoding='utf-8') as f:
            json.dump({
                "embeddings": context_embeddings
            }, f, ensure_ascii=False, indent=4)

    def load_context_embeddings(self):
        if self.link:
            context_embeddings_file = './qa-engine/data/link_query_context_embeddings_'+str(self.depth)+'.json'
        else:
            context_embeddings_file = './qa-engine/data/context_embeddings.json'

        # get current context corpus
        try:
            f = open(context_embeddings_file)
            data = json.load(f)
            if "embeddings" in data and len(data["embeddings"]) > 0:
                self.context_embeddings = [torch.tensor(embedding) for embedding in data["embeddings"]]
                print("preloaded context embeddings")
            f.close()
        except:
            pass


    def sentence_rank_filter(self, question): 
        threshold = .4
        question_embedding = self.sentence_model.encode(question, convert_to_tensor=True)
        filtered_contexts = []

        contexts_to_sort = []

        i = 0
        for context in self.contexts:
            similarity = util.pytorch_cos_sim(question_embedding, self.context_embeddings[i])
            # sort just in case
            print(context['text'])
            print(similarity)
            if similarity.item() > threshold:
                contexts_to_sort.append({
                    "text": context['text'],
                    "links": context['links'],
                    "elementSelector": context['elementSelector'],
                    "url": context['url'],
                    "similarity":  similarity.item()
                })
            i += 1

        sorted_contexts = sorted(contexts_to_sort, key=lambda d: d['similarity'], reverse=True) 
        
        return sorted_contexts

    # inference
    def ask_question(self, question):
        contexts_to_use = self.sentence_rank_filter(question)
        answers = []
        print('asking question: ' +question)
        print('question/context inference count: ' + str(len(contexts_to_use)))
        for context in contexts_to_use:
            # print('for context: '+context)
            QA_input = {
                'question': question,
                'context': context
            }

            res = self.nlp(QA_input)
            answers.append(res)

        if len(answers) > 0:
            sorted_answers = sorted(answers, key=lambda d: d['score'], reverse=True) 
            return sorted_answers[0]['answer']
        else:
            return ''

    def basic_search(self, query):
        contexts_to_use = self.sentence_rank_filter(query)
        return contexts_to_use

