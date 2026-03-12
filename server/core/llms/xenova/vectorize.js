const { pipeline } = require('@xenova/transformers');
const CONFIG = require("./config");

/**
 * @function vectorize
 * @async
 * @description
 * Generates high-dimensional numerical embeddings (vectors) from a given text string 
 * using a Transformer-based feature extraction model.
 * This function maps discrete text tokens into a continuous vector space where 
 * semantically similar concepts are mathematically closer to one another. It 
 * leverages the `@xenova/transformers` library to run models locally via ONNX 
 * Runtime, ensuring data privacy and reducing API latency.
 * 
 * The resulting `Float32Array` is optimized for downstream tasks such as:
 * - **Semantic Search**: Finding relevant documents based on meaning rather than keywords.
 * - **Clustering**: Grouping similar items in a dataset.
 * - **Classification**: Providing features for machine learning classifiers.
 * 
 * @param {string|string[]} text
 * The input string or array of strings to be transformed into vectors.
 * @param {Object} [options={}]
 * Configuration for the feature extraction process.
 * @param {string} [options.pooling="mean"]
 * The strategy used to aggregate individual token embeddings into a single sentence 
 * vector. Options typically include "mean" (average) or "cls" (first token).
 * @param {boolean} [options.normalize=true]
 * Whether to L2-normalize the output vector. Normalization is required if you 
 * intend to use dot product as a proxy for cosine similarity.
 * @param {Function} [options.extractor]
 * An optional pre-initialized `@xenova/transformers` pipeline instance. Providing 
 * this avoids the overhead of reloading the model on every call.
 * @param {string} [options.featureExtractionModel=CONFIG.featureExtractionModel]
 * The specific model ID (e.g., "Xenova/all-MiniLM-L6-v2") used to initialize 
 * the pipeline if an extractor is not provided.
 * @param {Object} [options...other]
 * Additional parameters passed directly to the underlying Transformers.js pipeline.
 * 
 * @returns {Promise<Float32Array>}
 * Resolves to a high-performance typed array representing the text's embedding.
 * 
 * @example
 * const vector = await vectorize("The Earth revolves around the Sun.");
 * console.log(vector); // Float32Array [ 0.012, -0.045, ... ]
 * 
 * @example
 * // Using a custom model and disabling normalization
 * const rawVector = await vectorize("Quantum computing", {
 * featureExtractionModel: "Xenova/bert-base-uncased",
 * normalize: false
 * });
 * 
 * @notes
 * - **Dimensionality**: The length of the returned array depends entirely on the 
 * chosen model (e.g., 384 for MiniLM, 768 for BERT-base).
 * - **Performance**: For batch processing, pass an array of strings to the `text` 
 * parameter to take advantage of parallelized inference.
 * 
 * @see {@link https://huggingface.co/docs/transformers.js|Transformers.js Documentation}
 */
let model;
const vectorize = async (
  text,
  {
    pooling = "mean",
    normalize = true,
    extractor,
    featureExtractionModel,
    ...other
  } = {}
) => {

  // Init extractor if needed.
  extractor || (
    extractor = model || (model = await createExtractor(featureExtractionModel))
  );

  // Feature extraction.
  const result = await extractor(text, {
    pooling,
    normalize,
    ...other
  });

  // Output vector.
  return new Float32Array(result.data);
}

const createExtractor = vectorize.createExtractor = async featureExtractionModel => (
  await pipeline("feature-extraction", featureExtractionModel || CONFIG.featureExtractionModel)
);

/**
 * @ignore
 * Default export with freezing.
 */
module.exports = Object.freeze(Object.defineProperty(vectorize, "vectorize", {
  value: vectorize
}));