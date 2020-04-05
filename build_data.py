import codecs, os, json, jsonlines, random, krippendorff
import numpy as np



# Calculate annotator agreement
def calculate_agreement(row, label2idx):
	tokens = row['tokens']
	annotations = row['annotations']

	reliability_data_str = []

	for annotator in annotations:

		annotation_list = ['*'] * len(tokens)
		for m in annotations[annotator]:
			start = m['start']
			end   = m['end']
			for x in range(start, end):
				# at this stage, only consider the last label (KA does not do multi-label)
				label = m['labels'][-1]
				label_idx = label2idx[label]
				annotation_list[x] = str(label_idx)

		annotation_str = "    ".join(annotation_list)
		#print(annotation_str)

		reliability_data_str.append(annotation_str)


	reliability_data = [[np.nan if v == '*' else int(v) for v in coder.split()] for coder in reliability_data_str]
	fleiss_data =       [[0 if v == '*' else int(v) for v in coder.split()] for coder in reliability_data_str]



	ka =  krippendorff.alpha(reliability_data=reliability_data, level_of_measurement='nominal')

	if np.isnan(ka):
		ka = 0.0
	if ka < 0.0:
		print(tokens)
		print(reliability_data)


	return ka




	# 1. Calculate label idxs




	# labelled_tokens = [ [token, [] ] for token in tokens ]

	# print(annotations)
	# for annotator in annotations:
	# 	for m in annotations[annotator]:
	# 		start = m['start']
	# 		end   = m['end']
			
	# 		for x in range(start, end):
	# 			labelled_tokens[x][1].append(set())
	# 			for l in m['labels']:
	# 				labelled_tokens[x][1][-1].add(l)
	#print(labelled_tokens)


def main():
	data = [ {} for x in range(500) ]
	label2idx = {}

	for filename in os.listdir('data'):
		with jsonlines.open('data/' + filename, 'r') as reader:
			for obj in reader:
				doc_idx = obj['doc_idx']
				tokens = obj['tokens']
				name = filename.split('annotations-')[-1].split('.json')[0]
				if data[doc_idx] == {}:
					data[doc_idx] = {
						'doc_idx': doc_idx,
						'tokens': tokens,
						'annotations': {}
					}
				if filename not in data[doc_idx]['annotations']:
					data[doc_idx]['annotations'][name] = {}
				data[doc_idx]['annotations'][name] = obj['mentions']

				for m in obj['mentions']:
					for label in m['labels']:
						if label not in label2idx:
							label2idx[label] = len(label2idx) + 1


	
	for row in data:
		row['agreement'] = calculate_agreement(row, label2idx)

		row['hasUnsureLabel'] = False
		for annotator in row['annotations']:
			for m in row['annotations'][annotator]:
				for l in m['labels']:
					if l == "Unsure":
						row['hasUnsureLabel'] = True

	sorted_data = sorted(data, key=lambda d: d['agreement'])
	with codecs.open('src/processed_data/data.json', 'w', 'utf-8') as f:
		json.dump(sorted_data, f)

if __name__ == "__main__":
	main()