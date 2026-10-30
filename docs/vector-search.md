# Vector semantic search

The product catalogue supports meaning-based search using local embeddings
and PostgreSQL's `pgvector` extension. Embedding inference runs in the
Next.js Node.js server; product and query text are not sent to a hosted
embedding API.

## Embedding model

- Model: [`Xenova/all-MiniLM-L6-v2`](https://huggingface.co/Xenova/all-MiniLM-L6-v2),
  the ONNX export of `sentence-transformers/all-MiniLM-L6-v2`.
- Dimensions: 384.
- Input for products: product name, description, and category name.
- Input for searches: the customer's natural-language query.
- Pooling and normalization: mean pooling with L2 normalization, using the
  same Transformers.js pipeline for product and query text.
- Runtime: `@huggingface/transformers` with CPU inference in Node.js. Model
  files are downloaded from Hugging Face on first use and cached locally.

## Storage and retrieval

Each product has one row in `ProductEmbedding`; its `embedding` column is
`vector(384)`. Product creation and edits update the product and its
embedding in one database transaction. The seed command indexes all
products, and existing catalogues can be rebuilt with:

```powershell
npm run db:index-embeddings
```

`POST /api/search/semantic` validates a 2–300 character query, embeds it with
the same model, and runs a parameterized pgvector query. Results include
active products only and are ordered by cosine distance (`<=>`); the
reported similarity is `1 - cosine distance`. A PostgreSQL HNSW index using
`vector_cosine_ops` supports approximate nearest-neighbor retrieval. Search
returns at most 12 results.

The Phase 5 migration removes prior 3-dimensional placeholder vectors
because they cannot be converted into valid 384-dimensional model
embeddings. Re-run the seed or indexing command after applying migrations.
