# Vector search design

The project will use PostgreSQL with the pgvector extension to store embeddings for active products and run similarity queries.

## Planned model

A local or approved embedding model will be used to generate vectors for product text and customer search input. The same model and embedding dimension will be used for both indexing and queries.

## Retrieval pattern

- Store an embedding per product in `ProductEmbedding`.
- Keep `productId` unique for one vector per product.
- Query with a parameterized cosine or L2 distance match using pgvector.
- Restrict results to active products.

This keeps semantic retrieval separate from basic keyword filtering while matching the assignment requirements.
