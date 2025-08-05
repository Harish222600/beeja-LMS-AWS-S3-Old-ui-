// Function to shuffle array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Function to check if arrays are equal
const areArraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((value, index) => value === arr2[index]);
};

// Function to shuffle match-the-following options and ensure they don't match original order
export const shuffleMatchingOptions = (options) => {
  const indices = Array.from({ length: options.length }, (_, i) => i);
  let shuffledIndices;
  
  // Keep shuffling until we get a different order
  do {
    shuffledIndices = shuffleArray([...indices]);
  } while (areArraysEqual(indices, shuffledIndices));

  // Map the shuffled indices to create new array with original indices tracked
  return shuffledIndices.map((index, newIndex) => ({
    text: options[index],
    originalIndex: index,
    displayIndex: newIndex
  }));
};
