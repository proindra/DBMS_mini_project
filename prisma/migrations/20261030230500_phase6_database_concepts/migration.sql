CREATE OR REPLACE VIEW "AdminSalesSummary" AS
SELECT
    COUNT(*)::INTEGER AS "orderCount",
    COALESCE(
        SUM("total") FILTER (WHERE "status" <> 'CANCELLED'),
        0
    )::TEXT AS "salesTotal"
FROM "Order";

CREATE INDEX "ProductEmbedding_embedding_cosine_idx"
ON "ProductEmbedding"
USING hnsw ("embedding" vector_cosine_ops);
