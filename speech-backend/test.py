from datasets import load_dataset

# Load the dataset (e.g., "jmaczan/TORGO" in your case)
dataset = load_dataset("jmaczan/TORGO")

# Print the fields of the dataset to understand its structure
print(dataset['train'].features)
