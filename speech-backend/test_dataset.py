from datasets import load_dataset
dataset = load_dataset("jmaczan/TORGO")
print(dataset['train'].features)
